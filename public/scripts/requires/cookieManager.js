export const cookies = {};
var pairs = document.cookie.split(";");
for (var i=0; i<pairs.length; i++){
  var pair = pairs[i].split("=");
  cookies[(pair[0]+'').trim()] = unescape(pair.slice(1).join('='));
}
export function deleteCookies(){
  document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  document.cookie = "pass=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}
