


(function(){
    let names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    let numberOfSlices = names.length;
    let sliceAngle = 2 * Math.PI / numberOfSlices;
    let rotation = 0;

    const canvas = document.getElementById('wheelCanvas');
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#dd6e42', '#E8DAB2', '#4F6D7A', '#C0D6DF', '#EAEAEA', '#57240F', '#E8DAB2', '#D9C281', '#C1D0D7'];
    const spinButton = document.getElementById('spinButton');
    const copyCloseBtn = document.getElementById('copyCloseBtn');
    const namesListInput = document.getElementById("namesListInput");
    spinButton.onclick = spinWheel;
    let timeoutId;

    function drawWheel() {
        ctx.clearRect(0, 25, canvas.width, canvas.height);

        for (let i = 0; i < numberOfSlices; i++) {
            const startAngle = rotation + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc((canvas.width) / 2, (canvas.height) / 2, (canvas.width-50) / 2, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[i % colors.length]; // alternating colours
            ctx.fill();
            ctx.stroke();
            
            // Draw name
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.font = '28px Arial';
            ctx.fillText(names[i], canvas.width / 4, 0);
            ctx.restore();
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            // ctx.fillText([rotation/Math.PI, Math.floor((((3.5-(rotation/Math.PI)%2)%2)/2)*numberOfSlices)], canvas.width - 80, 50);
            ctx.restore();
        }
    }

    function drawTriangle(){
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 12, 0);
        ctx.lineTo(canvas.width / 2 + 12, 0);
        ctx.lineTo(canvas.width / 2 , 25);
        ctx.lineTo(canvas.width / 2 - 12, 0);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
    }

    function fillResultCanvas(name ){
        var ctx = resultCanvas.getContext('2d');
        ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        

        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        ctx.restore();

        ctx.fillStyle = 'black';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, resultCanvas.width, resultCanvas.height);

        // Set the font size and style
        
        // Set the fill color for the text
        ctx.font = '25px Arial';
        ctx.fillStyle = '#00449e';
        
        // Write text on the canvas
        ctx.fillText('Winner', 30, 25);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`${name}`, 30, 60);
    }

    async function copyCanvasToClipboard() {
            
            try {
                // Convert canvas to blob
                resultCanvas.toBlob(async function(blob) {
                    if (!blob) return;
                    // Create clipboard item
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                }, 'image/png');
            } catch (err) {
                alert('Failed to copy: ' + err);
            }
        }

    function spinWheel() {
        const spinDuration = 3000+Math.random()*5000; // spin for 3 seconds
        // const spinDuration = 1500; // spin for 3 seconds
        const startTime = Date.now();
        const spin = () => {
            const elapsed = Date.now() - startTime;
            const spinSpeed = Math.min(20, Math.floor((spinDuration-elapsed)/(spinDuration*0.5)*20));
            if (elapsed < spinDuration) {
                inputDisabled(true);
                rotation += (Math.PI / 180) * spinSpeed; // spin speed
                drawWheel();
                requestAnimationFrame(spin);
            } else {
                inputDisabled(false);
                const selectedIndex = Math.floor((((3.5-(rotation/Math.PI)%2)%2)/2)*numberOfSlices);
                document.getElementById('winnerName').innerText = names[selectedIndex];
                fillResultCanvas(names[selectedIndex]);
                console.log(`Winner: ${names[selectedIndex]}`);
                MicroModal.show('modal-1');
            }
        };
        spin();
    }

    function inputDisabled(disabled){
        spinButton.disabled = disabled;
        namesListInput.disabled  = disabled;
    }

    function updateNamedependantValues(){
        numberOfSlices = names.length;
        sliceAngle = 2 * Math.PI / numberOfSlices;
        rotation = 0;
    }

    function loadNames() {
        let hashedNames = [];
        try {
            if (location.hash && location.hash.length > 1) {
                console.log("Hash found:", location.hash);
                const hashedObj = JSON.parse(atob(location.hash.substring(1)));
                if (hashedObj && Array.isArray(hashedObj.names)) {
                    hashedNames.push(...hashedObj.names);
                }
            }
            else {
                console.log("No hash found");
            }
        }
        catch (e) {
            console.error("Error parsing hash:", e);
        }

        if (hashedNames.length > 0) {
            names = hashedNames;
            console.log(`set names from hash ${names} ${names.length}`);
            localStorage.setItem("names", JSON.stringify(names));
            updateNamedependantValues();
            return;
        }

        try {
            let localNames = JSON.parse(localStorage.getItem('names'));
            if (Array.isArray(localNames)) {
                names = localNames.map(item => item.trim()).filter(item => item.length);
                hashedNames = localNames;
                window.location.hash = btoa(JSON.stringify({ names: names }));
                console.log(`set names from localStorage ${names} ${names.length}`);
            }
            else {
                names = [];
            };
            updateNamedependantValues();
        }
        catch (e) {
            console.error(e);
        }
    }

    loadNames();

    namesListInput.onkeyup = function(){
        clearTimeout(timeoutId);
        timeoutId = setTimeout(()=>{
            names = namesListInput.value.split('\n').map(item=>item.trim()).filter(item=>item.length);
            updateNamedependantValues();
            console.log(`set names ${names} ${names.length}`);
            localStorage.setItem("names", JSON.stringify(names));
            location.hash = btoa(JSON.stringify({names: names}));
            drawWheel();
        }, 200);
    }

    namesListInput.value = names.join('\n')

    window.onload=function(){
        // MicroModal.init({
        //     target: 'modal-1',
        //     disableScroll: true,
        //     disableFocus: true,
        //     openTrigger: 'data-micromodal-trigger',
        //     closeTrigger: 'data-micromodal-close',
        //     awaitOpenAnimation: false,
        //     awaitCloseAnimation: false,
        //     debugMode: false
        // });
        drawTriangle();
        drawWheel();
        copyCloseBtn.onclick = function() {
            copyCanvasToClipboard().then(() => {
                MicroModal.close('modal-1');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    };
})();