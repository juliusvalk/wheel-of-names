(function(){

    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#4c2169', '#cd6ea5', '#96ded4', '#128011', '#dd74ee', '#d8c6a9', '#1fbdda', '#7332f0', '#1a0447'];
    const spinButton = document.getElementById('spinButton');
    const namesListInput = document.getElementById("namesListInput");
    spinButton.onclick = spinWheel;
    let names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    let numberOfSlices = names.length;
    let sliceAngle = 2 * Math.PI / numberOfSlices;
    let rotation = 0;
    let timeoutId;

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        }
    }

    function spinWheel() {
        const spinDuration = 3000+Math.random()*5000; // spin for 3 seconds
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
                rotation %= 2 * Math.PI; // normalize rotation
                const selectedIndex = Math.floor((rotation + sliceAngle / 2) / sliceAngle) % numberOfSlices;
                console.log(`rotation ${rotation}`);
                alert(`Selected: ${names[selectedIndex]}`);
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

    try {
        let localNames = JSON.parse(localStorage.getItem('names'));
        if(Array.isArray(localNames)){
            names = localNames;
        };
    }
    catch(e){
        console.error(e);
    }

    namesListInput.onkeyup = function(){
        clearTimeout(timeoutId);
        timeoutId = setTimeout(()=>{
            names = namesListInput.value.split('\n').map(item=>item.trim()).filter(item=>item.length);
            updateNamedependantValues();
            console.log(`set names ${names} ${names.length}`);
            localStorage.setItem("names", JSON.stringify(names));
            drawWheel();
        }, 200);
    }

    namesListInput.value = names.join('\n')

    window.onload=drawWheel;
})();