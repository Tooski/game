  
        (function( game, $, undefined ) {

             //private variable
             var baseUrl = 'settings.php';

             game.settings = {

                 //public method. Saves resource.
                 "post" : function(data){
                          console.log(data);
                     $.post(baseUrl, data, function (data) {
                         //console.log(data);

                     })
                    .fail(function () {
                        alert("error");
                    });
                 },

                 //pubic method gets the resources.
                 "get" : function(callback){
                     $.get(baseUrl,callback)
                    .fail(function () {
                        alert("error");
                    });
                 }
             };

        }( window.game = window.game || {}, jQuery ));
