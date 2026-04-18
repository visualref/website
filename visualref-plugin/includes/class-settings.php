<?php
/**
 * VisualRef Admin Settings Page
 */

if (!defined('ABSPATH')) {
    exit;
}

class VR_Settings {
    
    private $page_slug = 'visualref-integration';
    private $integration_key;
    
    public function __construct() {
        $this->integration_key = new VR_Integration_Key();
        
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
    }
    
    public function add_admin_menu() {
        add_options_page(
            'VisualRef Integration',
            'VisualRef Integration',
            'manage_options',
            $this->page_slug,
            [$this, 'render_settings_page']
        );
    }
    
    public function register_settings() {
        register_setting('vr_settings_group', 'vr_settings', [
            'sanitize_callback' => [$this, 'sanitize_settings']
        ]);
        
        add_settings_section(
            'vr_main_section',
            'Integration Settings',
            [$this, 'render_section_description'],
            $this->page_slug
        );
        
        add_settings_field(
            'integration_key',
            'Integration Key',
            [$this, 'render_integration_key_field'],
            $this->page_slug,
            'vr_main_section'
        );
        
        add_settings_field(
            'default_category',
            'Default Category',
            [$this, 'render_category_field'],
            $this->page_slug,
            'vr_main_section'
        );
        
        add_settings_field(
            'default_tags',
            'Default Tags',
            [$this, 'render_tags_field'],
            $this->page_slug,
            'vr_main_section'
        );
        
        add_settings_field(
            'default_author',
            'Default Author',
            [$this, 'render_author_field'],
            $this->page_slug,
            'vr_main_section'
        );
        
        add_settings_field(
            'publish_status',
            'Default Publish Status',
            [$this, 'render_status_field'],
            $this->page_slug,
            'vr_main_section'
        );
    }
    
    public function enqueue_assets($hook) {
        if (strpos($hook, $this->page_slug) === false) {
            return;
        }
        
        wp_enqueue_style(
            'vr-admin-style',
            VR_PLUGIN_URL . 'assets/css/admin.css',
            [],
            VR_PLUGIN_VERSION
        );
        
        wp_enqueue_script(
            'vr-admin-script',
            VR_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery'],
            VR_PLUGIN_VERSION,
            true
        );
    }
    
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $integration_key = $this->integration_key->get();
        $site_name = $this->integration_key->get_site_name();
        $settings = get_option('vr_settings', []);
        
        $categories = get_categories(['hide_empty' => false]);
        $tags = get_tags(['hide_empty' => false]);
        $authors = get_users(['role' => 'administrator']);
        
        ?>
        <div class="wrap vr-settings-wrap">
            <h1>VisualRef Integration</h1>
            
            <div class="vr-header">
                <div class="vr-logo">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                        <rect width="50" height="50" rx="10" fill="#6366f1"/>
                        <path d="M15 20h20M15 30h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="vr-info">
                    <p>Connect your WordPress site to VisualRef to automatically publish articles.</p>
                </div>
            </div>
            
            <div class="vr-key-section">
                <h2>Your Integration Key</h2>
                <p class="description">Copy this key and paste it in the VisualRef dashboard to connect your site.</p>
                
                <div class="vr-key-display">
                    <code id="vr-integration-key"><?php echo esc_html($integration_key ?: 'Not generated yet'); ?></code>
                    <button type="button" class="button" id="vr-copy-key" <?php echo empty($integration_key) ? 'disabled' : ''; ?>>
                        Copy Key
                    </button>
                </div>
                
                <div class="vr-key-actions">
                    <?php if (empty($integration_key)): ?>
                        <button type="button" class="button button-primary" id="vr-generate-key">
                            Generate Integration Key
                        </button>
                    <?php else: ?>
                        <button type="button" class="button" id="vr-regenerate-key">
                            Regenerate Key
                        </button>
                    <?php endif; ?>
                </div>
            </div>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('vr_settings_group');
                do_settings_sections($this->page_slug);
                submit_button();
                ?>
            </form>
            
            <hr>
            
            <div class="vr-connection-test">
                <h2>Connection Test</h2>
                <button type="button" class="button" id="vr-test-connection">
                    Test Connection
                </button>
                <div id="vr-test-result"></div>
            </div>
            
            <div class="vr-docs-link">
                <p>Need help? <a href="https://visualref.ai/docs/integrations/wordpress" target="_blank">View Documentation</a></p>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            var $key = $('#vr-integration-key').text().trim();
            
            $('#vr-copy-key').on('click', function() {
                navigator.clipboard.writeText($key).then(function() {
                    alert('Integration key copied!');
                });
            });
            
            $('#vr-generate-key, #vr-regenerate-key').on('click', function() {
                var $btn = $(this);
                $btn.prop('disabled', true).text('Processing...');
                
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'vr_generate_key',
                        security: '<?php echo wp_create_nonce('vr_nonce'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            $('#vr-integration-key').text(response.data.key);
                            $key = response.data.key;
                            $('#vr-copy-key').prop('disabled', false);
                            $('#vr-regenerate-key').show();
                            $('#vr-generate-key').hide();
                        } else {
                            alert('Error generating key');
                        }
                        $btn.prop('disabled', false).text($btn.hasClass('button-primary') ? 'Generate Integration Key' : 'Regenerate Key');
                    },
                    error: function() {
                        alert('Error generating key');
                        $btn.prop('disabled', false).text($btn.hasClass('button-primary') ? 'Generate Integration Key' : 'Regenerate Key');
                    }
                });
            });
            
            $('#vr-test-connection').on('click', function() {
                var $btn = $(this);
                var $result = $('#vr-test-result');
                
                $btn.prop('disabled', true).text('Testing...');
                $result.html('<p>Testing connection...</p>');
                
                $.ajax({
                    url: '<?php echo esc_url(rest_url('vr/v1/verify')); ?>',
                    type: 'POST',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-VR-Key', $key);
                    },
                    success: function(response) {
                        $result.html('<p style="color: green;">Connection successful! Site: ' + response.site.name + '</p>');
                        $btn.prop('disabled', false).text('Test Connection');
                    },
                    error: function(xhr) {
                        $result.html('<p style="color: red;">Connection failed: ' + xhr.responseJSON.message + '</p>');
                        $btn.prop('disabled', false).text('Test Connection');
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function render_section_description() {
        echo '<p>Configure how VisualRef publishes articles to your WordPress site.</p>';
    }
    
    public function render_integration_key_field() {
        $key = $this->integration_key->get();
        echo '<p>Your integration key is shown above. Click regenerate to create a new key (old key will stop working).</p>';
    }
    
    public function render_category_field() {
        $settings = get_option('vr_settings', []);
        $categories = get_categories(['hide_empty' => false]);
        
        echo '<select name="vr_settings[default_category]">';
        echo '<option value="">-- Select Category --</option>';
        
        foreach ($categories as $category) {
            $selected = isset($settings['default_category']) && $settings['default_category'] == $category->term_id ? 'selected' : '';
            echo '<option value="' . $category->term_id . '" ' . $selected . '>' . esc_html($category->name) . '</option>';
        }
        
        echo '</select>';
        echo '<p class="description">Articles will be published to this category by default.</p>';
    }
    
    public function render_tags_field() {
        $settings = get_option('vr_settings', []);
        $tags = get_tags(['hide_empty' => false]);
        $selected_tags = $settings['default_tags'] ?? [];
        
        echo '<select name="vr_settings[default_tags][]" multiple="multiple" class="vr-tags-select">';
        
        foreach ($tags as $tag) {
            $selected = in_array($tag->term_id, $selected_tags) ? 'selected' : '';
            echo '<option value="' . $tag->term_id . '" ' . $selected . '>' . esc_html($tag->name) . '</option>';
        }
        
        echo '</select>';
        echo '<p class="description">Select tags to apply to articles by default. Hold Ctrl/Cmd to select multiple.</p>';
    }
    
    public function render_author_field() {
        $settings = get_option('vr_settings', []);
        $authors = get_users(['role' => 'administrator']);
        
        echo '<select name="vr_settings[default_author]">';
        echo '<option value="">-- Select Author --</option>';
        
        foreach ($authors as $author) {
            $selected = isset($settings['default_author']) && $settings['default_author'] == $author->ID ? 'selected' : '';
            echo '<option value="' . $author->ID . '" ' . $selected . '>' . esc_html($author->display_name) . '</option>';
        }
        
        echo '</select>';
        echo '<p class="description">Articles will be attributed to this author by default.</p>';
    }
    
    public function render_status_field() {
        $settings = get_option('vr_settings', []);
        $status = $settings['status'] ?? 'publish';
        
        echo '<select name="vr_settings[status]">';
        echo '<option value="publish" ' . ($status === 'publish' ? 'selected' : '') . '>Publish Immediately</option>';
        echo '<option value="draft" ' . ($status === 'draft' ? 'selected' : '') . '>Draft</option>';
        echo '</select>';
        echo '<p class="description">Default publish status for new articles.</p>';
    }
    
    public function sanitize_settings($input) {
        $sanitized = [];
        
        $sanitized['default_category'] = isset($input['default_category']) ? (int)$input['default_category'] : '';
        $sanitized['default_tags'] = isset($input['default_tags']) ? array_map('intval', $input['default_tags']) : [];
        $sanitized['default_author'] = isset($input['default_author']) ? (int)$input['default_author'] : '';
        $sanitized['status'] = isset($input['status']) && in_array($input['status'], ['publish', 'draft']) ? $input['status'] : 'publish';
        
        return $sanitized;
    }
}

add_action('wp_ajax_vr_generate_key', function() {
    check_ajax_referer('vr_nonce', 'security');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized');
    }
    
    $integration_key = new VR_Integration_Key();
    $key = $integration_key->generate();
    
    wp_send_json_success(['key' => $key]);
});