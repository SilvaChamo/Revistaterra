<?php
/**
 * Revista Terra – Reenvio em massa para o Next.js
 *
 * USO (UMA SÓ VEZ):
 *   1. Coloca este ficheiro em: public_html/wp-content/mu-plugins/
 *   2. Abre no browser: https://revistaterraonline.com/?rt_bulk_sync=CHAVE_SECRETA
 *   3. Aguarda a mensagem "Concluído". Depois apaga este ficheiro do servidor.
 *
 * A chave secreta está definida abaixo em RT_BULK_SECRET.
 * O filtro anti-spam é exactamente o mesmo do revistaterra-sync.php.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'RT_BULK_SECRET',      'rt_bulk_2024_revistaterra' );
define( 'RT_BULK_NEXTJS_URL',  'https://revistaterra.visualdesignmoz.com' );
define( 'RT_BULK_WH_SECRET',   'c6a98be250fc952ff5f30049904ee0730a972d57ded5bddc7e280337ce9a4cd7' );
define( 'RT_BULK_BATCH_PAUSE', 300000 ); // microsegundos entre envios (0,3s) para não sobrecarregar

// ============================================================
// FILTRO ANTI-SPAM (igual ao revistaterra-sync.php)
// ============================================================

function rt_bulk_is_spam( $title, $slug, $content ) {
    $spam_pattern = '/casino|kasyno|cazino|cazinou|slot|slots|gokkasten|roulette|poker|bonus|bonussen|betting|apuesta|pbn-preflight|cw-check|khelostar|mrbet|spins|gambling|judi|sbobet|pragmatic|zeus|scatter|jackpot|esportes da sorte|bet365|1xbet|pelican|vox|fatpirate|olympe|winit|kingz|vasy|monixbet|yocasino|skycity|nvcasinos|lowen|zitbet|jeetwin|baji|mostbet|melbet|parimatch|pin-up|aviator|fortune tiger/i';
    $foreign_spam = '/[\x{0400}-\x{04FF}\x{0900}-\x{097F}\x{0980}-\x{09FF}]|roku|graczy|zakładach|wypłaty|grać|juegos|jugadores|ganancias|retirar|apuestas|kaszinó|pénz/u';

    if ( preg_match( $spam_pattern, $title ) || preg_match( $spam_pattern, $slug ) ) return true;
    if ( preg_match( $foreign_spam, $title ) ) return true;
    if ( preg_match( $spam_pattern, substr( $content, 0, 1000 ) ) ) return true;

    return false;
}

// ============================================================
// ENDPOINT DE REENVIO
// ============================================================

add_action( 'init', function () {
    if ( ! isset( $_GET['rt_bulk_sync'] ) ) return;
    if ( $_GET['rt_bulk_sync'] !== RT_BULK_SECRET ) {
        wp_die( 'Chave inválida.', 403 );
    }

    // Desliga limite de tempo de execução
    @set_time_limit( 0 );

    header( 'Content-Type: text/plain; charset=utf-8' );
    header( 'X-Accel-Buffering: no' ); // Nginx: envia output em tempo real
    ob_implicit_flush( true );
    @ob_end_flush();

    echo "=== Revista Terra – Reenvio em massa para Next.js ===\n\n";

    $paged    = 1;
    $enviados = 0;
    $spam     = 0;

    do {
        $query = new WP_Query( [
            'post_type'      => 'post',
            'post_status'    => 'publish',
            'posts_per_page' => 50,
            'paged'          => $paged,
            'orderby'        => 'date',
            'order'          => 'ASC',
            'no_found_rows'  => false,
        ] );

        if ( ! $query->have_posts() ) break;

        foreach ( $query->posts as $post ) {
            if ( rt_bulk_is_spam( $post->post_title, $post->post_name, $post->post_content ) ) {
                echo "  [SPAM ignorado] " . esc_html( $post->post_title ) . "\n";
                $spam++;
                continue;
            }

            $payload = rt_bulk_build_payload( $post );
            $body    = wp_json_encode( $payload );
            $sig     = 'sha256=' . hash_hmac( 'sha256', $body, RT_BULK_WH_SECRET );

            $response = wp_remote_post(
                RT_BULK_NEXTJS_URL . '/api/webhook/wordpress',
                [
                    'timeout'     => 20,
                    'headers'     => [
                        'Content-Type'       => 'application/json',
                        'X-WP-Webhook-Event' => 'upsert',
                        'X-WP-Signature'     => $sig,
                    ],
                    'body'        => $body,
                    'data_format' => 'body',
                ]
            );

            $code = is_wp_error( $response )
                ? $response->get_error_message()
                : wp_remote_retrieve_response_code( $response );

            echo "  [" . $code . "] " . esc_html( $post->post_title ) . "\n";
            $enviados++;

            usleep( RT_BULK_BATCH_PAUSE );
        }

        $paged++;
    } while ( $paged <= $query->max_num_pages );

    echo "\n=== Concluído: {$enviados} enviados, {$spam} spam ignorados ===\n";
    exit;
} );

// ============================================================
// PAYLOAD (igual ao revistaterra-sync.php)
// ============================================================

function rt_bulk_build_payload( $post ) {
    $categories = get_the_category( $post->ID );
    $cats = array_map( function( $cat ) {
        return [ 'id' => $cat->term_id, 'name' => $cat->name, 'slug' => $cat->slug ];
    }, $categories ?: [] );

    $tags_raw = get_the_tags( $post->ID );
    $tags = $tags_raw ? array_map( function( $tag ) {
        return [ 'id' => $tag->term_id, 'name' => $tag->name, 'slug' => $tag->slug ];
    }, $tags_raw ) : [];

    $featured_image = null;
    $thumb_id = get_post_thumbnail_id( $post->ID );
    if ( $thumb_id ) {
        $full  = wp_get_attachment_image_src( $thumb_id, 'full' );
        $large = wp_get_attachment_image_src( $thumb_id, 'large' );
        $featured_image = [
            'id'        => $thumb_id,
            'url'       => $full  ? $full[0]  : '',
            'url_large' => $large ? $large[0] : '',
            'alt'       => get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ),
            'caption'   => wp_get_attachment_caption( $thumb_id ),
        ];
    }

    $author = [
        'id'          => $post->post_author,
        'name'        => get_the_author_meta( 'display_name', $post->post_author ) ?: 'Revista Terra',
        'avatar'      => get_avatar_url( $post->post_author, [ 'size' => 96 ] ),
        'description' => get_the_author_meta( 'description', $post->post_author ),
    ];

    return [
        'action'         => 'upsert',
        'id'             => $post->ID,
        'slug'           => $post->post_name,
        'title'          => html_entity_decode( get_the_title( $post->ID ), ENT_QUOTES, 'UTF-8' ),
        'excerpt'        => wp_strip_all_tags( get_the_excerpt( $post->ID ) ),
        'content'        => $post->post_content,
        'content_html'   => apply_filters( 'the_content', $post->post_content ),
        'status'         => $post->post_status,
        'date'           => $post->post_date_gmt . 'Z',
        'modified'       => $post->post_modified_gmt . 'Z',
        'link'           => get_permalink( $post->ID ),
        'author'         => $author,
        'categories'     => $cats,
        'tags'           => $tags,
        'featured_image' => $featured_image,
    ];
}
