function Submit(){
  orderdata = new Object()
  userdata = new Object()
  function sendOrder(userdata,selected_menu){
    $.ajax({
      url: '/cafe/user_order',
      type: 'POST',
      data: {userdata: userdata, orderdata: selected_menu}
    })
    .done(function(data) {
      window.location = "/cafe/main.html"
      //window.location = "/cafe/order_fin.html"
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      alert(errorThrown);
    })
  }
  function getObject(callback){
    orderdata = JSON.parse(unescape($('.orderdata').val()))
    userdata = JSON.parse(unescape($('.userdata').val()))
    userdata.ect = $('#ect').val();
    userdata.payment = $(":radio[name=payment]:checked").val();
    logObject()
    return callback(userdata,orderdata)
  }
  function logObject(){
    console.log(orderdata,userdata);
  }
  this.submit_with_ect = function(){
    getObject(sendOrder)
  }
}
$(document).ready(function() {
  var submit = new Submit();
  $('#finish').click(function(event) {
    submit.submit_with_ect()
  })
})
