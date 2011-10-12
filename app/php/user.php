<?php 

class User extends wiaModel {

    /* Attributes List */
    public $id;
    public $first_name;
    public $last_name;
    public $connected;

    /* Extra functions */
    public static function create(Array $data){     
    
        return parent::create(Array $data);
    }
    public static function get($id){
    
        return parent::get($id);
    }
    public function update(Array $data){
    
        return parent::update($data);
	}
	public function delete(){
	
        return parent::delete();
    }
}
