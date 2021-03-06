$(document).ready(function(){
  function login(){
    $.ajax({
      url: "/cafe/login",
      method:"post",
      data: {'username':$("#username").val(),'password':$("#password").val() },
      success: function(data){
        console.log("login server accessed");
        var login = eval("("+data+")")
        if (login.username) {
          $(".notification").html(login.username+"님이 로그인하셨습니다")
          location.reload();
        }else {
          $(".notification").html(login.err)
        }
      }
    })
  }
  console.log("js loaded");
  $('#password').keypress(function(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        login()
    }
  });
  $("#login-button").click(function(event){
    login()
  });

    $("#signup-button").click(function(event){
    window.location = '/cafe/sign_up.html'
  });

    $("#usermodify-button").click(function(event){
    window.location = '/cafe/user_modify.html'
  });
  $("#logout-button").click(function(){
    $.ajax({
      url: "/cafe/logout",
      method:"get",
      data: null,
      success: function(data){
        console.log("logged out");
        var login = eval("("+data+")")
        if (data) {
          $(".notification").html(login.err)
        }else {
          $(".notification").html("logout successful")
        }
      }
    })
    location.reload();
  })
  /*모바일 UX*/
  $('.nonuserlogin-change').click(function() {
    $('.userbox').addClass('inactive')
    $('.nonuserbox').addClass('active')
  });
  $('.userlogin-change').click(function() {
    $('.userbox').removeClass('inactive')
    $('.nonuserbox').removeClass('active')
  });
})
