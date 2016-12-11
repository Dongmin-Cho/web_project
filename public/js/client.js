/*check duplicated id*/
//by jodongmin
function checkID() {
    if ($('#id').val() === "") {
        alert("아이디를 입력해 주세요.");
        $('#id').focus();
    } else {
        $.ajax({
            url: '/signUp',
            type: 'POST',
            data: {
                'id': $('#id').val()
            },
            dataType: 'html',
            success: function(data) {
                    alert(data);
                } //end success function
        });
    } //end else
} //end function

/*add evnet listener when enter key is up*/
//by jodongmin
$(".login-info").keyup(function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btn-login").click();
    }
});

/*when log in, check it is valid*/
//by jodongmin
function checkValidLogin() {
    if ($('#id').val() === "") {
        alert("아이디를 입력해 주세요.");
        $('#id').focus();
    } else if ($('#pw').val() === "") {
        alert("비밀번호를 입력해 주세요.");
        $('#id').focus();
    } else {
        $.ajax({
            url: '/login',
            type: 'POST',
            data: {
                'id': $('#id').val(),
                'password': $('#pw').val()
            },
            dataType: 'html',
            success: function(data) {
                    window.location.href = data;
                  }
        });
    } //end else
} //end function
