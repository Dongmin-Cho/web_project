/*check id is valid*/
//by jodongmin

$(document).ready(function() { //id 입력란 변경시 유효성 체크
    $("#signUp-id").change(function() {
        var check = true;
        if (/\W/.test($('#signUp-id').val()) || $('#signUp-id').val().length > 12 || $('#signUp-id').val().length < 4) {
            $('#signUp-id').focus();
            $('#checkDUP').html('<b style="font-style: normal;">ID는 4글자에서 12글자의 영문 대소문자와 숫자만 가능합니다.</b>');
            check = false;
        }
        if ($('#signUp-id').val() === "") {
            $('#signUp-id').focus();
            $('#checkDUP').html('<b style="font-style: normal;">아이디를 입력해 주세요.</b>');
            check = false;

        }
        if (check) {
            $.ajax({
                url: '/checkDUP',
                type: 'POST',
                data: {
                    'id': $('#signUp-id').val()
                },
                dataType: 'html',
                success: function(data) {
                        if (data === 'VALID') {
                            $('#checkDUP').html('<b style="font-style: normal; color: blue;">사용 가능한 ID입니다.</b>');
                        } else {
                            $('#checkDUP').html('<b style="font-style: normal; color: red;">중복된 ID입니다.</b>');
                        }
                    } //end success function
            });
        }
    });
});

/*add evnet listener when enter key is up*/
//by jodongmin
$(".login-info").keyup(function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btn-login").click();
    }
});

function signUp() {
    console.log();
    if (/중복[가-힇]*[\w]*[\d]*/.test($('#checkDUP').text())) {
        $('#signUp-id').focus();
        alert('ID가 유효하지 않습니다.');
    } else if (!(/\W/.test($('#signUp-pw').val())) || !(/\w/.test($('#signUp-pw').val())) ||
        $('#signUp-pw').val().length > 20 || $('#signUp-pw').val().length < 6) { //특수문자를 포함한 6~20개의 문자열
        $('#signUp-pw').focus();
        alert('하나 이상의 특수문자를 입력해주시고 비밀번호는 6~20글자 입니다.');
    } else {
      console.log('???');
        var materials = $("input:checkbox:checked").map(function() {
            return $(this).val();
        }).get(); // get checked box value

        $.ajax({
            url: '/signUp',
            type: 'POST',
            data: {
                'id': $('#signUp-id').val(),
                'password': $('#signUp-pw').val(),
                'materials': materials
            },
            dataType: 'html',
            success: function(data) {
                if (data === 'SUCCESS') {
                    alert('회원가입이 완료되었습니다. 확인을 누르면 메인 페이지로 이동합니다.');
                    window.location.href = '/test';
                } else {
                    alert('오류가 발생했습니다. 다시 시도해주시기 바랍니다.');
                }
            }
        });
    }
}
/*when log in, check it is valid*/
//by jodongmin
$(document).ready(function() { //DOM이 준비되고
    $('#btn-login').submit(function() { //문서의 모든 form이 submit될때
        if ($('#id').val() === "") {
            alert("아이디를 입력해 주세요.");
            $('#id').focus();
            return false;
        } else if ($('#pw').val() === "") {
            alert("비밀번호를 입력해 주세요.");
            $('#id').focus();
            return false;
        } else {
            return true;
        } //end else
    });
});
