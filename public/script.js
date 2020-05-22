// tabs

var tabLinks = document.querySelectorAll(".tablinks");
var tabContent = document.querySelectorAll(".tabcontent");


tabLinks.forEach(function (el) {
    el.addEventListener("click", openTabs);
});


function openTabs(el) {
    var btnTarget = el.currentTarget;
    var option = btnTarget.dataset.option;

    tabContent.forEach(function (el) {
        el.classList.remove("active");
    });

    tabLinks.forEach(function (el) {
        el.classList.remove("active");
    });

    document.querySelector("#" + option).classList.add("active");

    btnTarget.classList.add("active");
}

function readURL(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();

        reader.onload = function (e) {
            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);
            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);
        };

        reader.readAsDataURL(input.files[0]);

    } else {
        removeUpload();
    }
}

function removeUpload() {
    $("#getTxtFile").val('');
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
    $('.image-upload-wrap').removeClass('image-dropping');
    setTimeout(() => {
        checkValuesFileText()
    }, 100);
    document.getElementById('convertedText').innerHTML = ''

}
$('.image-upload-wrap').bind('dragover', function () {
    $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function () {
    $('.image-upload-wrap').removeClass('image-dropping');
});

function checkValuesFileText() {

    if (document.getElementById("getTxtFile").files.length == 0) {
        $('#send').attr('disabled', 'disabled');
        $('#send').removeClass('ready')
        $('#download').attr('disabled', 'disabled');
        $('#download').removeClass('ready')
    } else {
        $('#send').removeAttr('disabled');
        $('#send').addClass('ready')
        $('#download').removeAttr('disabled');
        $('#download').addClass('ready')
    }
}

(function () {
    checkValuesFileText()
    $('#getTxtFile').change(function () {
        checkValuesFileText()
    });
})()


const $form = $('form')
// $form.on('submit', submitHandler)

function send() {
    showLoader()
    const databody = new FormData()
    const myFile = document.getElementById('getTxtFile').files
    for (const file of myFile) {
        databody.append('avatar', file)
    }

    axios.post('/getText', databody).
        then(res => {
            hideLoader()
            document.getElementById('convertedText').innerHTML = res.data
        }).
        catch(err => {
            hideLoader()
            console.log('err', err)
        })

}
function download() {
    showLoader()
    const databody = new FormData()
    const myFile = document.getElementById('getTxtFile').files
    for (const file of myFile) {
        databody.append('avatar', file)
    }

    axios.post('/download', databody, {
        responseType: 'blob', // had to add this one here
    }).then(res => {
        downloadFile(res)
        hideLoader()
    }).catch(err => {
        hideLoader()
        console.log('err', err)
    })

}

function downloadFile(response) {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${document.getElementById('getTxtFile').files[0].name.split('.')[0]}_to_pdf_${Date.now()}.pdf`
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
}

function hideLoader() {
    $('#loaderFrame').addClass('loader-hidden')
}

function showLoader() {
    $('#loaderFrame').removeClass('loader-hidden')
}
