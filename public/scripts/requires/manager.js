export function openSearchEngine(){
  $(".search-engine").css("display","block");
  setTimeout(()=>{ $(".search-box").addClass("search-box-focus"); }, 0.1);
}
export function closeSearchEngine(){
  $(".search-box").removeClass("search-box-focus");
  $(".search-engine").css("display","none");
}

export function openLogs(){
  $(".logs").css("display","block");
  setTimeout(()=>{ $(".logs").removeClass("logs-fade");  }, 0.1);
}
export function closeLogs(){
  $(".logs").addClass("logs-fade");
  $(".logs").css("display","none");
}

export function openChatBox(clientName){
  $(".chat-manager").css("display","block");
  setTimeout(()=>{ $(".chat-section").addClass("chat-on"); }, 0.1);

  $(".friend-DP").attr("src","https://avatars.dicebear.com/api/adventurer/" + clientName + ".svg" + "?scale=85");
  $(".friend-Name").html(clientName);
}
export function closeChatBox(){
  setTimeout(()=>{ $(".chat-section").removeClass("chat-on"); }, 0.1);
  $(".chat-manager").css("display","none");
}
