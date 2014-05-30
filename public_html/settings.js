  
        (function( game, $, undefined ) {

             //private variable
             var baseUrl = 'settings.php';

             game.settings = {
                 
                 // ******** THIS WILL NEED TO BE FIXED, QUERY IS FOR TESTING... USE GET INSTEAD.
                 "query" : function(callback){
                     console.log("test");
                     $.get("querytable.php", function(data) {
                         console.log(data);
                         callback();
                     })
                    .fail(function () {
                        alert("error");
                    });
                 },
                
                
                 //public method. Saves resource.
                 "post" : function(data, callback){
                          console.log(data);
                     $.post(baseUrl, data,callback)
                    .fail(function () {
                        alert("error");
                    });
                 },

                 //pubic method gets the resources.
                 "get" : function(data, callback){
                     console.log(data);
                     $.get(baseUrl ,data,callback)
                    .fail(function () {
                        alert("error");
                    });
                 }
                 
                 
                 
                 
             };
             
     
                


        }( window.game = window.game || {}, jQuery ));
