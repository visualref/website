<?php
/**
 * Integration Key Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class VR_Integration_Key {
    
    private $option_name = 'vr_integration_key';
    private $key_name = 'vr_integration_key_name';
    
    public function generate() {
        $site_url = get_bloginfo('url');
        $site_name = get_bloginfo('name');
        $random = bin2hex(random_bytes(16));
        
        $data = base64_encode(json_encode([
            'url' => $site_url,
            'name' => $site_name,
            'random' => $random,
            'time' => time()
        ]));
        
        $hash = hash_hmac('sha256', $data, $this->get_salt());
        
        $key = $data . '.' . substr($hash, 0, 32);
        
        update_option($this->option_name, $key);
        update_option($this->key_name, $site_name);
        
        return $key;
    }
    
    public function get() {
        return get_option($this->option_name, '');
    }
    
    public function validate($key) {
        if (empty($key)) {
            return false;
        }
        
        $stored_key = $this->get();
        
        if (empty($stored_key)) {
            return false;
        }
        
        return hash_equals($stored_key, $key);
    }
    
    public function regenerate() {
        delete_option($this->option_name);
        delete_option($this->key_name);
        return $this->generate();
    }
    
    public function delete() {
        delete_option($this->option_name);
        delete_option($this->key_name);
    }
    
    private function get_salt() {
        $auth_key = defined('AUTH_KEY') ? AUTH_KEY : '';
        $salt = get_option('vr_salt', '');
        
        if (empty($salt)) {
            $salt = bin2hex(random_bytes(32));
            update_option('vr_salt', $salt);
        }
        
        return $auth_key . $salt;
    }
    
    public function get_site_name() {
        return get_option($this->key_name, '');
    }
}