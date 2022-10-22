import * as manager from "./manager.js";

//Chat-effects
$(".log-option-messages").click(()=>{
  $(".log-option-messages").addClass("log-option-selected");
  $(".log-option-add-more").removeClass("log-option-selected");

  $(".chat-rooms").addClass("section-focus");
  $(".add-more").removeClass("section-focus");
});

$(".log-option-add-more").click(()=>{
  $(".log-option-messages").removeClass("log-option-selected");
  $(".log-option-add-more").addClass("log-option-selected");

  $(".chat-rooms").removeClass("section-focus");
  $(".add-more").addClass("section-focus");
});

$(".chat").click(function(){
  manager.openChatBox();
  manager.closeLogs();
});

$(".nav-option-back").click(function(){
  manager.openLogs();
  manager.closeChatBox();
});
