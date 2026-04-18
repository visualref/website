<?php
/**
 * Plugin Name: VisualRef Integration
 * Plugin URI: https://visualref.ai
 * Description: Connect VisualRef to your WordPress site and publish articles automatically.
 * Version: 1.0.0
 * Author: VisualRef
 * Author URI: https://visualref.ai
 * Text Domain: visualref-integration
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

define('VR_PLUGIN_VERSION', '1.0.0');
define('VR_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('VR_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once VR_PLUGIN_PATH . 'includes/class-api.php';
require_once VR_PLUGIN_PATH . 'includes/class-settings.php';
require_once VR_PLUGIN_PATH . 'includes/class-integration-key.php';

add_action('plugins_loaded', function() {
    new VR_API();
    new VR_Settings();
});