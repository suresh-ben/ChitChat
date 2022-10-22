import * as manager from "./manager.js";

//Search-effects
$(".log-search").click(()=>{
  manager.openSearchEngine();
  manager.closeLogs();
});
$(".cancel").click(()=>{
  manager.openLogs();
  manager.closeSearchEngine();
});

export function addTip(){
  let tip = $((document.createElement('div')));
  tip.html("Find your friends");
  tip.attr("style", "height:93vh; color: white; display:flex; align-content:center; justify-content: center");
  $(".search-list").append(tip);

}

$(".search-clear").click(()=>{
  $(".search-bar input").val("");
  $(".search-list").html("");
  addTip();
});

//resieve data from the server using socket.io
//show the results
