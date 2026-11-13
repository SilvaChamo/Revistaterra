<?php
/**
 * Plugin Name: Revista Terra – Sync para Next.js
 * Description: Envia notícias genuínas para o projecto Next.js (Supabase) via webhook sempre que uma notícia é publicada ou actualizada, com filtro anti-spam integrado.
 * Version: 1.0.0
 * Author: Revista Terra
 *
 * INSTALAÇÃO NA HOSTINGER:
 * 1. Aceda ao Gestor de Ficheiros (File Manager) em: public_html/wp-content/mu-plugins/
 *    (se a pasta "mu-plugins" não existir dentro de wp-content, crie-a).
 * 2. Crie ou carregue este ficheiro com o nome: revistaterra-sync.php
 * 3. Pronto! Não necessita de activação no painel, os mu-plugins ficam activos automaticamente.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ============================================================
// CONFIGURAÇÃO AUTOMÁTICA (JÁ CONFIGURADA)
// ============================================================

define( 'MLTMARK_NEXTJS_URL', 'https://revistaterra-moz.vercel.app' );
define( 'MLTMARK_WEBHOOK_SECRET', 'c6a98be250fc952ff5f30049904ee0730a972d57ded5bddc7e280337ce9a4cd7' );

// ============================================================
// FILTRO ANTI-LIXO / ANTI-SPAM
// ============================================================

function revistaterra_is_spam( $title, $slug, $content ) {
    $spam_pattern = '/casino|kasyno|cazino|cazinou|slot|slots|gokkasten|roulette|poker|bonus|bonussen|betting|apuesta|pbn-preflight|cw-check|khelostar|mrbet|spins|gambling|judi|sbobet|pragmatic|zeus|scatter|jackpot|esportes da sorte|bet365|1xbet|pelican|vox|fatpirate|olympe|winit|kingz|vasy|monixbet|yocasino|skycity|nvcasinos|lowen|zitbet|jeetwin|baji|mostbet|melbet|parimatch|pin-up|aviator|fortune tiger/i';
    
    // Caracteres cirílicos, hindi, bengali, etc. ou palavras de spam comuns
    $foreign_spam = '/[\x{0400}-\x{04FF}\x{0900}-\x{097F}\x{0980}-\x{09FF}]|roku|graczy|zakładach|wypłaty|grać|juegos|jugadores|ganancias|retirar|apuestas|kaszinó|pénz/u';

    if ( preg_match( $spam_pattern, $title ) || preg_match( $spam_pattern, $slug ) ) return true;
    if ( preg_match( $foreign_spam, $title ) ) return true;
    if ( preg_match( $spam_pattern, substr( $content, 0, 1000 ) ) ) return true;

    return false;
}

// ============================================================
// HOOKS
// ============================================================

add_action( 'save_post', 'revistaterra_on_save_post', 20, 3 );

function revistaterra_on_save_post( $post_id, $post, $update ) {
    if ( wp_is_post_revision( $post_id ) ) return;
    if ( wp_is_post_autosave( $post_id ) ) return;
    if ( $post->post_type !== 'post' ) return;
    if ( $post->post_status !== 'publish' ) return;

    // Bloqueia lixo e spam antes de enviar
    if ( revistaterra_is_spam( $post->post_title, $post->post_name, $post->post_content ) ) {
        error_log( '[Revista Terra Sync] Post ignorado por ser detectado como spam/lixo: ' . $post->post_title );
        return;
    }

    revistaterra_send_webhook( 'upsert', $post_id );
}

add_action( 'wp_trash_post',  'revistaterra_on_delete_post' );
add_action( 'before_delete_post', 'revistaterra_on_delete_post' );

function revistaterra_on_delete_post( $post_id ) {
    if ( get_post_type( $post_id ) !== 'post' ) return;
    revistaterra_send_webhook( 'delete', $post_id );
}

// ============================================================
// ENVIO DO WEBHOOK
// ============================================================

function revistaterra_send_webhook( $action, $post_id ) {
    $post = get_post( $post_id );
    if ( ! $post ) return;

    $payload = revistaterra_build_payload( $action, $post );
    $body    = wp_json_encode( $payload );

    // Assinatura de segurança HMAC-SHA256
    $signature = 'sha256=' . hash_hmac( 'sha256', $body, MLTMARK_WEBHOOK_SECRET );

    $response = wp_remote_post(
        MLTMARK_NEXTJS_URL . '/api/webhook/wordpress',
        [
            'timeout'     => 15,
            'headers'     => [
                'Content-Type'       => 'application/json',
                'X-WP-Webhook-Event' => $action,
                'X-WP-Signature'     => $signature,
            ],
            'body'        => $body,
            'data_format' => 'body',
        ]
    );

    if ( is_wp_error( $response ) ) {
        error_log( '[Revista Terra Sync] Erro no Webhook (' . $action . '): ' . $response->get_error_message() );
    } else {
        $code = wp_remote_retrieve_response_code( $response );
        if ( $code !== 200 ) {
            error_log( '[Revista Terra Sync] Webhook HTTP ' . $code . ' para o post #' . $post_id );
        }
    }
}

// ============================================================
// MONTAGEM DO PAYLOAD
// ============================================================

function revistaterra_build_payload( $action, $post ) {
    // Categorias
    $categories = get_the_category( $post->ID );
    $cats = array_map( function( $cat ) {
        return [
            'id'   => $cat->term_id,
            'name' => $cat->name,
            'slug' => $cat->slug,
        ];
    }, $categories ?: [] );

    // Tags
    $tags_raw = get_the_tags( $post->ID );
    $tags = $tags_raw ? array_map( function( $tag ) {
        return [
            'id'   => $tag->term_id,
            'name' => $tag->name,
            'slug' => $tag->slug,
        ];
    }, $tags_raw ) : [];

    // Imagem em destaque
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

    // Autor
    $author = [
        'id'          => $post->post_author,
        'name'        => get_the_author_meta( 'display_name', $post->post_author ) ?: 'Revista Terra',
        'avatar'      => get_avatar_url( $post->post_author, [ 'size' => 96 ] ),
        'description' => get_the_author_meta( 'description', $post->post_author ),
    ];

    return [
        'action'          => $action,
        'id'              => $post->ID,
        'slug'            => $post->post_name,
        'title'           => html_entity_decode( get_the_title( $post->ID ), ENT_QUOTES, 'UTF-8' ),
        'excerpt'         => wp_strip_all_tags( get_the_excerpt( $post->ID ) ),
        'content'         => $post->post_content,
        'content_html'    => apply_filters( 'the_content', $post->post_content ),
        'status'          => $post->post_status,
        'date'            => $post->post_date_gmt . 'Z',
        'modified'        => $post->post_modified_gmt . 'Z',
        'link'            => get_permalink( $post->ID ),
        'author'          => $author,
        'categories'      => $cats,
        'tags'            => $tags,
        'featured_image'  => $featured_image,
    ];
}
