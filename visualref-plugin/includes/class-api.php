<?php
/**
 * VisualRef REST API Endpoints
 */

if (!defined('ABSPATH')) {
    exit;
}

class VR_API {
    
    private $namespace = 'vr/v1';
    private $integration_key;
    
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        $this->integration_key = new VR_Integration_Key();
    }
    
    public function register_routes() {
        register_rest_route($this->namespace, '/verify', [
            'methods' => 'POST',
            'callback' => [$this, 'verify_connection'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route($this->namespace, '/publish', [
            'methods' => 'POST',
            'callback' => [$this, 'publish_article'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route($this->namespace, '/update', [
            'methods' => 'POST',
            'callback' => [$this, 'update_article'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route($this->namespace, '/categories', [
            'methods' => 'GET',
            'callback' => [$this, 'get_categories'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route($this->namespace, '/tags', [
            'methods' => 'GET',
            'callback' => [$this, 'get_tags'],
            'permission_callback' => '__return_true'
        ]);
        
        register_rest_route($this->namespace, '/authors', [
            'methods' => 'GET',
            'callback' => [$this, 'get_authors'],
            'permission_callback' => '__return_true'
        ]);
    }
    
    private function authenticate() {
        $auth_header = isset($_SERVER['HTTP_X_VR_KEY']) ? $_SERVER['HTTP_X_VR_KEY'] : '';
        
        if (empty($auth_header)) {
            return new WP_Error('unauthorized', 'Integration key is required', ['status' => 401]);
        }
        
        if (!$this->integration_key->validate($auth_header)) {
            return new WP_Error('invalid_key', 'Invalid integration key', ['status' => 401]);
        }
        
        return true;
    }
    
    public function verify_connection($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $site_url = get_bloginfo('url');
        $site_name = get_bloginfo('name');
        $version = VR_PLUGIN_VERSION;
        
        $settings = get_option('vr_settings', []);
        
        return new WP_REST_Response([
            'success' => true,
            'site' => [
                'url' => $site_url,
                'name' => $site_name,
                'version' => $version
            ],
            'settings' => [
                'default_category' => $settings['default_category'] ?? '',
                'default_tags' => $settings['default_tags'] ?? [],
                'default_author' => $settings['default_author'] ?? '',
                'status' => isset($settings['status']) ? $settings['status'] : 'publish'
            ]
        ], 200);
    }
    
    public function publish_article($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $title = sanitize_text_field($request->get_param('title') ?? '');
        $content = wp_kses_post($request->get_param('content') ?? '');
        $excerpt = sanitize_text_field($request->get_param('excerpt') ?? '');
        $featured_image = esc_url_raw($request->get_param('featured_image') ?? '');
        $slug = sanitize_title($request->get_param('slug') ?? '');
        
        $settings = get_option('vr_settings', []);
        
        $category = !empty($request->get_param('category')) 
            ? (int)$request->get_param('category') 
            : (!empty($settings['default_category']) ? (int)$settings['default_category'] : 1);
        
        $tags = !empty($request->get_param('tags')) 
            ? array_map('intval', $request->get_param('tags')) 
            : (!empty($settings['default_tags']) ? array_map('intval', $settings['default_tags']) : []);
        
        $author_id = !empty($request->get_param('author_id')) 
            ? (int)$request->get_param('author_id') 
            : (!empty($settings['default_author']) ? (int)$settings['default_author'] : 1);
        
        $status = $request->get_param('status') ?? ($settings['status'] ?? 'publish');
        
        if (empty($title) || empty($content)) {
            return new WP_Error('missing_data', 'Title and content are required', ['status' => 400]);
        }
        
        $post_data = [
            'post_title' => $title,
            'post_content' => $content,
            'post_excerpt' => $excerpt,
            'post_status' => $status,
            'post_author' => $author_id,
            'post_category' => [$category],
            'tags_input' => $tags,
            'post_name' => $slug ?: sanitize_title($title)
        ];
        
        if (!empty($featured_image)) {
            $attachment_id = $this->download_and_attach_image($featured_image, $post_data['post_name']);
            if ($attachment_id) {
                $post_data['featured_image'] = $attachment_id;
            }
        }
        
        $post_id = wp_insert_post($post_data, true);
        
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        
        if (!empty($slug)) {
            wp_update_post([
                'ID' => $post_id,
                'post_name' => $slug
            ]);
        }
        
        return new WP_REST_Response([
            'success' => true,
            'post_id' => $post_id,
            'post_url' => get_permalink($post_id)
        ], 200);
    }
    
    public function update_article($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $post_id = (int)$request->get_param('post_id');
        $title = sanitize_text_field($request->get_param('title') ?? '');
        $content = wp_kses_post($request->get_param('content') ?? '');
        $excerpt = sanitize_text_field($request->get_param('excerpt') ?? '');
        $featured_image = esc_url_raw($request->get_param('featured_image') ?? '');
        
        if (empty($post_id)) {
            return new WP_Error('missing_data', 'Post ID is required', ['status' => 400]);
        }
        
        $post = get_post($post_id);
        if (!$post) {
            return new WP_Error('not_found', 'Post not found', ['status' => 404]);
        }
        
        $update_data = ['ID' => $post_id];
        
        if (!empty($title)) {
            $update_data['post_title'] = $title;
        }
        
        if (!empty($content)) {
            $update_data['post_content'] = $content;
        }
        
        if (!empty($excerpt)) {
            $update_data['post_excerpt'] = $excerpt;
        }
        
        $status = $request->get_param('status');
        if (!empty($status)) {
            $update_data['post_status'] = $status;
        }
        
        $result = wp_update_post($update_data, true);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        if (!empty($featured_image)) {
            $attachment_id = $this->download_and_attach_image($featured_image, get_post_field('post_name', $post_id));
            if ($attachment_id) {
                update_post_meta($post_id, '_thumbnail_id', $attachment_id);
            }
        }
        
        return new WP_REST_Response([
            'success' => true,
            'post_id' => $post_id,
            'post_url' => get_permalink($post_id)
        ], 200);
    }
    
    public function get_categories($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $categories = get_categories(['hide_empty' => false]);
        
        return new WP_REST_Response([
            'success' => true,
            'categories' => array_map(function($cat) {
                return [
                    'id' => $cat->term_id,
                    'name' => $cat->name,
                    'slug' => $cat->slug
                ];
            }, $categories)
        ], 200);
    }
    
    public function get_tags($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $tags = get_tags(['hide_empty' => false]);
        
        return new WP_REST_Response([
            'success' => true,
            'tags' => array_map(function($tag) {
                return [
                    'id' => $tag->term_id,
                    'name' => $tag->name,
                    'slug' => $tag->slug
                ];
            }, $tags)
        ], 200);
    }
    
    public function get_authors($request) {
        $auth = $this->authenticate();
        if (is_wp_error($auth)) {
            return $auth;
        }
        
        $authors = get_users(['role' => 'administrator']);
        
        return new WP_REST_Response([
            'success' => true,
            'authors' => array_map(function($author) {
                return [
                    'id' => $author->ID,
                    'name' => $author->display_name,
                    'email' => $author->user_email
                ];
            }, $authors)
        ], 200);
    }
    
    private function download_and_attach_image($image_url, $post_name) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        
        $tmp = download_url($image_url);
        
        if (is_wp_error($tmp)) {
            return false;
        }
        
        $file_array = ['name' => $post_name . '-' . time() . '.jpg', 'tmp_name' => $tmp];
        
        $attachment_id = media_handle_sideload($file_array, 0);
        
        if (is_wp_error($attachment_id)) {
            @unlink($tmp);
            return false;
        }
        
        return $attachment_id;
    }
}