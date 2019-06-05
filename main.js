let canvas;
let context;
let mainParam;
let imageCount = 0;
let inputCount = 0;
let imHistory = [];
let mode;
let scale;
const modeConstants = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
};

function resizeCanvas() {
    if (imHistory.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    canvas.width = imHistory[0].scaleWidth;
    canvas.height = imHistory[0].scaleHeight;
    
    imageCount = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    
    if (mode === modeConstants.HORIZONTAL){
        let x = 0;
        for (const image of imHistory) {
            image.x = x;
            image.y = 0;
            x += image.scaleWidth;
            canvasWidth += image.scaleWidth;
            imageCount += 1;
        }
        canvas.width = canvasWidth;
    } else if (mode === modeConstants.VERTICAL){
        let y = 0;
        for (const image of imHistory) {
            image.x = 0;
            image.y = y;
            y += image.scaleHeight;
            canvasHeight += image.scaleHeight;
            imageCount += 1;
        }
        canvas.height = canvasHeight;
    }   
    
    for (const pic of imHistory) {
        context.drawImage(pic.image, pic.x, pic.y, pic.scaleWidth, pic.scaleHeight);
    }

}

function scaleIm(picture) {

    if (mode === modeConstants.HORIZONTAL){
        if (imageCount === 0) {
            mainParam = picture.height;
        }
        scale = mainParam / picture.height;
        console.log('while horizontal', scale);
    } else if ( mode === modeConstants.VERTICAL) {
        if (imageCount === 0) {
            mainParam = picture.width;
        }
        scale = mainParam / picture.width;
        console.log('while vertical', scale);
    }

    scaleHeight = picture.height * scale;
    scaleWidth = picture.width * scale;
    
    return [scaleWidth, scaleHeight];
}

function draw(image, inputNumber) {
    var reader = new FileReader();

    reader.addEventListener('load', (event) =>{
        const pic = new Image();
        pic.addEventListener('load', () => {
            const [scaleWidth, scaleHeight] = scaleIm(pic);
            const imageObj = {
                image: pic,
                scaleWidth,
                scaleHeight,
                inputNumber,
            };
            if(imHistory.length > 0){
                imHistory = imHistory
                    .filter(pic => pic.inputNumber != inputNumber);
            }
            
            imHistory.push(imageObj);
            if (imHistory.length > 0){
                imHistory
                    .sort((pic1, pic2) => pic1.inputNumber - pic2.inputNumber);
            }

            resizeCanvas();
        }, false);
    
        pic.src = event.target.result;
    });

    reader.readAsDataURL(image);
}

function createInput() {
    const button = document.getElementById('button-div');
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.className = 'input';
    newInput.dataset.id = inputCount;
    newInput.setAttribute('accept','.png, .jpg, .jpeg');

    newInput.addEventListener('change', () => {
        const image = newInput.files[0];
        draw(image, newInput.dataset.id);
    }, false);

    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.dataset.id = inputCount;
    newButton.innerHTML = `Remove ${inputCount+1}`;

    newButton.addEventListener('click', handleRemoveButton, false);

    const newDiv = document.createElement('div');
    newDiv.className = 'add-remove';
    newDiv.appendChild(newInput)
    newDiv.appendChild(newButton);

    document.getElementById('root-form').insertBefore(newDiv,button);

    inputCount += 1;
}

function handleRadio (event) {
    if (event.target.checked){
        mode = event.target.value;
        imageCount = 0;
        if (imHistory.length > 0) {
            for (const image of imHistory) {
                const [rescaleW, rescaleH] = scaleIm(image.image);
                image.scaleWidth = rescaleW;
                image.scaleHeight = rescaleH;
                resizeCanvas();
            };
        };
    };
}

function handleRemoveButton (event) {
    const neededInput = event.target.dataset.id;
    const inputGroup = document.getElementsByClassName('input');
    for (const input of inputGroup) {
        if (input.dataset.id === neededInput) {
            event.target.parentNode.removeChild(event.target);
            input.parentNode.removeChild(input);
            if (imHistory.length > 0) {
                imHistory = imHistory
                        .filter(pic => pic.inputNumber != neededInput);
            };
            resizeCanvas();
        };
    };
}

function load() {
    canvas = document.getElementById('tiles');
    if(canvas.getContext){
        context = canvas.getContext('2d');
    };
    document.getElementById('add-button').onclick = createInput;
    
    const radio = document.getElementsByName('render');
    if (radio) {
        for (var i = 0; i < radio.length; i++) {
            if(radio[i].checked){
                mode = radio[i].value;
            }
            radio[i].addEventListener('change', handleRadio, false);
        }
    }
}   

window.onload = load;