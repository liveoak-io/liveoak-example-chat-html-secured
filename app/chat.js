

$( function() {
  var liveoak = new LiveOak( {
      host: document.location.hostname,
      port: document.location.port,
      auth: {
        clientId: 'chat-html-secured-client',
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
        $('<div class="name">').append( data.text ) ).append(
        $('<div class="text">').append(
          $('<button id="delete_' + get_id( data ) + '">' ).click(function() {
            trigger_remove_message(this.id);
          }).append ("Delete message") ) ) );
    $( '#messages' ).scrollTop( $('#messages')[0].scrollHeight );
  }

  function remove_message(data) {
    $( '#' + get_id( data ) ).remove();
  }

  function update_message(data) {
    var msg = $( '#' + get_id( data ) );
    msg.find( $('.name')[0] ).html( data.name );
    msg.find( $('.name')[1] ).html( data.text );
  }

  function trigger_remove_message(msgId) {
    var id = msgId.substring(msgId.indexOf("_") + 1);
    liveoak.remove( '/chat-html-secured/storage/chat', { id: 'ObjectId("' + id + '")'}, {
      success: function(data) {
        console.log("Message deleted: " + data.id );
      },
      error: function(error) {
        alert("Error in deleting message. Status: " + error.status + ", Details: " + error.statusText);
    }} );
  }

  function get_id(data) {
// Parse "12345" from string like: ObjectId("12345")
    var msgId = data.id.substring(data.id.indexOf('"') + 1);
    msgId = msgId.substring(0, msgId.indexOf('"'));
    return msgId;
  }

  function authCallback() {
    $('body').css('display', 'block');
    $( '#user-info' ).html( "Logged in as: " + liveoak.auth.idToken.preferred_username );
    liveoak.connect( "Bearer", liveoak.auth.token, function() {
      // If admin is logged, we will try to create chat collection
      if (liveoak.auth.hasResourceRole('admin', 'chat-html-secured')) {
        liveoak.create('/chat-html-secured/storage', { id: 'chat' }, {
          success: function (data) {
            console.log("Chat collection successfully created")
          },
          error: function (error) {
            alert("Not able to create CHAT collection. Status: " + error.status + ", Details: " + error.statusText );
          }
        });
      };



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
      });

      liveoak.read( '/chat-html-secured/storage/chat?expand=members', {
        success: function(data) {
          $(data._members).each( function(i, e) {
            add_message( e );
          } );
        }
      });

    });
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
