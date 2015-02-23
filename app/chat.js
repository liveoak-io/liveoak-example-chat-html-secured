

$( function() {
  var liveoak = new LiveOak( {
      host: document.location.hostname,
      port: document.location.port,
      auth: {
        appClientId: 'chat-html-secured-client',
        realm: 'liveoak-apps'
      }
    }
  );

  var app = liveoak.app();

  liveoak.auth.init({ onLoad: 'login-required' }).success(authCallback).error(function(data) {
    alert( "authentication failed: " + data.error );
  });

  function add_message(data) {
    $( '#welcome').hide();
    $( '#messages' ).append(
      $( '<div class="message clearfix" id="' + get_id( data ) + '">' ).append(
        $('<span class="badge badge-primary pull-left" style="background-color:' + get_color(data.name) + '">').append( data.name[0] ) ).append(
        $('<div class="name-text pull-left">').append(
          $('<div class="name">').append( data.name ) ).append(
          $('<div class="text">').append( data.text ) ) ).append(
        $('<button class="btn btn-link btn-icon delete" id="delete_' + get_id( data ) + '">' ).click(function() {
            trigger_remove_message(this.id);
          }).append(
            $('<i class="fa fa-trash-o"></i>')
          ).append(
            $('<span>Delete Message</span>')
          ).append(
          $('</button>') ) ) );
    window.scrollTo(0, document.body.scrollHeight);
  }

  function remove_message(data) {
    $( '#' + get_id( data ) ).remove();
    if ($( '.message' ).length === 0) {
      $( '#welcome').show();
    }
  }

  function update_message(data) {
    var msg = $( '#' + get_id( data ) );
    msg.find( '.name' ).html( data.name );
    msg.find( '.text' ).html( data.text );
  }

  function trigger_remove_message(msgId) {
    var id = msgId.substring(msgId.indexOf("_") + 1);
    app.remove( '/storage/chat', { id: 'ObjectId("' + id + '")'}, {
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

  function hash(str) {
    var hash = 0, i, chr, len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  function get_color(name) {
    if (usedColors[name]) {
      return usedColors[name];
    }
    else {
      if (colors.length === 0) {
        colors = colorsBackup.slice(0);
      }
      var idx = Math.abs(hash(name)) % colors.length;
      var color = colors[idx]
      usedColors[name] = color;
      colors.splice(idx, 1);
      return color;
    }
  }

  var colors = ['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800','#FF5722','#795548','#9E9E9E','#607D8B','#000000'];
  var colorsBackup = colors.slice(0);
  var usedColors = {};

  function authCallback() {
    $('body').css('display', 'block');
    $( '.namebar' ).html( '<span id="name-field">Logged in as: ' + liveoak.auth.idToken.preferred_username + '</span>' );
    liveoak.connect( "Bearer", liveoak.auth.token, function() {
      // If admin is logged, we will try to create chat collection
      if (liveoak.auth.hasResourceRole('admin', app.applicationId)) {
        liveoak.create('/storage', { id: 'chat' }, {
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

      app.subscribe( '/storage/chat/*', function(data, action) {
        if (action == 'create') {
          add_message( data );
        } else if (action == 'update') {
          update_message( data );
        } else if (action == 'delete') {
          remove_message( data );
        }
      });

      app.read( '/storage/chat?fields=*(*)', {
        success: function(data) {
          $(data.members).each( function(i, e) {
            add_message( e );
          } );
        }
      });

    });
  };

  $('#logout').click(function() {
    liveoak.auth.logout();
  });

  $('#input').keypress(function(e) {
    if (e.which == 13) {
      $('#input form').submit();
      return false;
    }
  });

  $('#input form').submit( function() {
    var name = liveoak.auth.idToken.preferred_username;
    var text = $( '#text-field' ).val();

    if (!name || !text) return false;

    $('#text-field').val( '' );

    app.create( '/storage/chat',
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
