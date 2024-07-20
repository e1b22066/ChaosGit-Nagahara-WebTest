document.getElementById('sabotageButton').addEventListener('click', function() {
    document.getElementById('overlay').classList.add('open');
    document.getElementById('popup').classList.add('open');
});

document.getElementById('closePopupButton').addEventListener('click', function() {
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('popup').classList.remove('open');
});

document.getElementById('popupButton').addEventListener('click', function() {
    alert('Popup Button Clicked!');
})