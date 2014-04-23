

$( function() {
  var liveoak = new LiveOak( {
      host: "localhost",
      port: 8080,
      auth: {
        clientId: 'chat-html-secured',
        realm: 'liveoak-apps'
      }
    }
  );

  liveoak.auth.init('login-required').success(authCallback).error(function(data) {
    alert( "authentication failed: " + data.error );
  });

  function add_message(data) {
    $( '#messages' ).append( 
      $( '<div class="message" id="' + get_id( data ) + '">' ).append(
        $('<div class="name">').append( data.name ) ).append( 
        $('<div class="text">').append( data.text ) ) );
    $( '#messages' ).scrollTop( $('#messages')[0].scrollHeight );
  }

  function remove_message(data) {
    $( '#' + get_id( data ) ).remove();
  }

  function update_message(data) {
    var msg = $( '#' + get_id( data ) );
    msg.find( '.name' ).html( data.name );
    msg.find( '.text' ).html( data.text );
  }

  function get_id(data) {
// Strip out everything before ':'
    return data.id.substring(data.id.indexOf(':') + 1);
  }

  function authCallback() {
    $('body').css('display', 'block');
    $( '#user-info' ).html( "Logged in as: " + liveoak.auth.idToken.preferred_username );
    liveoak.connect( "Bearer", liveoak.auth.token, function() {
      liveoak.create( '/chat-html-secured/storage', { id: 'chat' }, {
        success: function(data) {

          liveoak.onStompError( function(frame) {
            alert("Stomp error received. Details: " + frame);
          });

          liveoak.subscribe( '/chat-html-secured/storage/chat/*', function(data, action) {
            if (action == 'create') {
              add_message( data );
            } else if (action == 'update') {
              update_message( data );
            } else if (action == 'delete') {
              remove_message( data );
            }
          } );
          liveoak.read( '/chat-html-secured/storage/chat?expand=members', {
            success: function(data) {
              $(data._members).each( function(i, e) {
                add_message( e );
              } );
            }
          } );
        },
        error: function(data) {
          alert( "chat Collection NOT created. Error: " + data.status );
        }
      } );
    } );
  };

  $('#logout').click(function() {
    liveoak.auth.logout();
  });

  $('#input form').submit( function() {
    var name = liveoak.auth.idToken.preferred_username;
    var text = $( '#text-field' ).val();

    $('#text-field').val( '' );

    liveoak.create( '/chat-html-secured/storage/chat',
                    { name: name, text: text },
                    { success: function(data) { 
                        console.log( "sent" ); 
                      },
                      error: function(error) {
                        alert( error.status + ": " + error.statusText );
                      }
                  } );
    return false;
  } );

} )
