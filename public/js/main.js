$(function() {

  var socket = io.connect();
  var iconSet = ["lol-lucian", "lol-zed", "lol-leona", "lol-yi", "lol-fiora"];
  var clientName = "";
  var clientIcon = "";
  var whisper = "";

  socket.on("new message", function(data){
    $(".chat-msgWrapper").append(newMsg(getTime(), data.icon, data.name, $("<div>").text(data.msg.msg).html()));
    $(".chat-msgPool").scrollTop($(".chat-msgPool")[0].scrollHeight);
  });

  socket.on("whisper", function(data){
    if(data.msg.to == clientName){
      $(".chat-msgWrapper").append(newWhisper(getTime(), data.msg.icon, data.name, $("<div>").text(data.msg.msg).html(), "", "对你说"));
    }else if(data.name == clientName){
      $(".chat-msgWrapper").append(newWhisper(getTime(), data.msg.icon, data.msg.to, $("<div>").text(data.msg.msg).html(),"你对","说"));
    }
  })

  socket.on("add user", function(data){
    $(".chat-list").html("");
    for(var i=0;i<data.length;i++){
      if(data[i].name == clientName){
        $(".chat-list").append(addUser(data[i].icon, data[i].name, true));
      }else{
        $(".chat-list").append(addUser(data[i].icon, data[i].name));
      }
    }
  });

  socket.on("show info new user", function(data){
    $(".chat-info").append("<div class='chat-sys-info'>欢迎<span>"+data.name+"</span>!</div>");
  });

  socket.on("show info disconnect", function(data){
    $(".chat-info").append("<div class='chat-sys-info'><span>"+data+"</span> 滚蛋了!</div>");
  })

  $("#msg-send").on("click", function(){
    sendMsg();
  });

  $("#login").on("click", function(){
    login();
  });

  $(document).on("keypress", function(e){
    if(e.target.id=="msg-input" && e.keyCode==13){
      sendMsg();
    }else if(e.target.id=="login-name" && e.keyCode==13){
      login();
    }
  });

  $(document).on("click", ".msg-user span", function(event){
    $(this).siblings(".msg-more").toggle();
  });

  $(document).on("click", ".msg-pChat", function(){
    whisper = $(this).parent().siblings("span").text();
    sendWhisper();
  });

  $(document).on("click", ".userBox", function(){
    whisper = $(this).find(".user-name span").text();
    sendWhisper();
  });

  $(".chat-to img").on("click", function(){
    $(".chat-to").animate({
      top: "0"
    }, 200);
    whisper = "";
  });

  function login(){
    var name = $("#login-name").val();
    clientIcon = iconSet[Math.floor(Math.random()*iconSet.length)];
    if($.trim(name)){
      socket.emit("new user", {name: name, icon: clientIcon}, function(data){
        if(data){
          $(".loginArea").fadeOut();
          clientName = name;
        }else{
          alert("Name is already taken!");
          $("#login-name").val("");
        }
      });
    }
  }

  function sendWhisper(){
    if(whisper == clientName){
      alert("私密自己没意义");
      $(".msg-more").hide();
    }else{
      $(".chat-to span").text(whisper);
      $(".msg-more").hide();
      $(".chat-to").animate({
        top: "-30px"
      }, 200);
    }
  }

  function sendMsg(){
    var msg = $("#msg-input").val();
    if($.trim(msg)){
        if(whisper){
          socket.emit("send message", {
            to: whisper,
            icon: clientIcon,
            msg: msg
          }, function(data){

          });
        }else{
          socket.emit("send message", {
            to: "all",
            msg: msg
          });
        }
    }
    $("#msg-input").val("");
  }

  function getTime(){
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return h+": "+m;
  }

  function newMsg(time, icon, username, content){
    if(username){
      var msgContent =
        "<div class='msg-box clearfix'>"+
          "<div class='msg-info clearfix'>"+
            "<div class='msg-time'>"+
              "[<span>"+time+"</span>]"+
            "</div>"+
            "<div class='msg-icon "+icon+"'></div>"+
            "<div class='msg-user'>"+
              "<span>"+username+"</span>:"+
              "<ul class='msg-more'>"+
                "<li class='msg-pChat'>Private Chat</li>"+
              "</ul>"+
            "</div>"+
          "</div>"+
          "<div class='msg-content'>"+
            content+
          "</div>"+
        "</div>";
      return msgContent;
    }
  }

  function newWhisper(time, icon, username, content, extra1, extra2){
    if(username){
      var msgContent =
        "<div class='msg-box clearfix'>"+
          "<div class='msg-info clearfix'>"+
            "<div class='msg-time'>"+
              "[<span>"+time+"</span>]"+
            "</div>"+
            "<div class='msg-icon "+icon+"'></div>"+
            "<div class='msg-user'>"+
              extra1+"<span>"+username+"</span>"+extra2+":"+
              "<ul class='msg-more'>"+
                "<li class='msg-pChat'>Private Chat</li>"+
              "</ul>"+
            "</div>"+
          "</div>"+
          "<div class='msg-content-whisper'>"+
            content+
          "</div>"+
        "</div>";
      return msgContent;
    }
  }

  function addUser(icon, name, isCurrentUser){
    if(name){
      var style = "";
      if(isCurrentUser){
        style = "style='color:red;'";
      }
      var user =
      "<div class='userBox clearfix'>"+
        "<div class='user-icon "+icon+"'></div>"+
        "<div class='user-name'><span "+style+">"+name+"</span></div>"+
      "</div>";
      return user;
    }
  }

});
