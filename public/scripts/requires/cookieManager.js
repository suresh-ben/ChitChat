export const cookies = {};
var pairs = document.cookie.split(";");
for (var i=0; i<pairs.length; i++){
  var pair = pairs[i].split("=");
  cookies[(pair[0]+'').trim()] = unescape(pair.slice(1).join('='));
}

export function makeCookies(data){
  //expiry
  var todayDate = new Date();
  var expDate = todayDate.setDate(todayDate.getDate() + 15);
  expDate = new Date(expDate);

  const id = data.id;
  const pass = data.pass;
  document.cookie = "id=" + id + "; expires=" + expDate;
  document.cookie = "pass=" + pass + "; expires=" + expDate;

  //lets do chatting
  window.location.replace("/");
}

export function deleteCookies(){
  document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  document.cookie = "pass=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}
