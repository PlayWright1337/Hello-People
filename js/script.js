document.getElementById('timestamp').textContent = new Date().toISOString();
document.getElementById('session-id').textContent = '0x' + Math.random().toString(16).substr(2, 12).toUpperCase();
document.getElementById('useragent').textContent = navigator.userAgent;
document.getElementById('screen').textContent = window.screen.width + 'x' + window.screen.height;
document.getElementById('color-depth').textContent = window.screen.colorDepth + 'bit';
document.getElementById('language').textContent = navigator.language;
document.getElementById('languages').textContent = navigator.languages ? navigator.languages.join(', ') : navigator.language;
document.getElementById('platform').textContent = navigator.platform;
document.getElementById('cores').textContent = navigator.hardwareConcurrency || 'Unknown';
document.getElementById('ram').textContent = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown';
document.getElementById('touch').textContent = navigator.maxTouchPoints > 0 ? 'Да (' + navigator.maxTouchPoints + ' точек)' : 'Нет';
detectBrowser();
detectOS();
generateFingerprints();
getBatteryInfo();
getNetworkInfo();
getWebGLInfo();
getPlugins();
detectFonts();

function detectBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    document.getElementById('browser').textContent = browser;
}

function detectOS() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    document.getElementById('os').textContent = os;
}

// Get IP data
fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
        document.getElementById('ip').textContent = data.ip;
        document.getElementById('country').textContent = data.country_name;
        document.getElementById('city').textContent = data.city || 'Unknown';
        document.getElementById('org').textContent = data.org || 'Unknown';
        document.getElementById('coords').textContent = data.latitude + ', ' + data.longitude;
        document.getElementById('timezone').textContent = data.timezone;
        
        // Show map using static map API (no API key needed)
        showMap(data.latitude, data.longitude);
    })
    .catch(err => {
        console.error('IP lookup failed:', err);
        document.getElementById('ip').textContent = 'Не удалось получить';
        document.getElementById('country').textContent = 'Не удалось получить';
        document.getElementById('city').textContent = 'Не удалось получить';
        document.getElementById('org').textContent = 'Не удалось получить';
        document.getElementById('coords').textContent = 'Не удалось получить';
        document.getElementById('timezone').textContent = 'Не удалось получить';
        document.getElementById('map').innerHTML = '<div style="padding:40px;text-align:center;color:#666;">Не удалось загрузить карту</div>';
    });

let map = null;
let marker = null;

function showMap(lat, lon) {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([lat, lon], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);
    const redIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width:20px;height:20px;background:#ff3333;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px #ff3333;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    marker = L.marker([lat, lon], { icon: redIcon }).addTo(map);
}

function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
}

function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 60;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px "Arial"';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 200, 60);
        ctx.fillStyle = '#069';
        ctx.fillText('Canvas Fingerprint Test', 10, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.font = '18px "Times New Roman"';
        ctx.fillText('Hello World! 🎨', 10, 35);
        ctx.beginPath();
        ctx.moveTo(150, 10);
        ctx.bezierCurveTo(180, 20, 170, 40, 190, 50);
        ctx.stroke();
        
        return canvas.toDataURL();
    } catch (e) {
        return 'Not available';
    }
}

function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'Not available';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return vendor + '::' + renderer;
        }
        return gl.getParameter(gl.VENDOR) + '::' + gl.getParameter(gl.RENDERER);
    } catch (e) {
        return 'Not available';
    }
}

async function getAudioFingerprint() {
    try {
        const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioContext) return 'Not available';
        
        const context = new AudioContext(1, 44100, 44100);
        const oscillator = context.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;
        
        const compressor = context.createDynamicsCompressor();
        oscillator.connect(compressor);
        compressor.connect(context.destination);
        
        oscillator.start(0);
        oscillator.stop(0.1);
        
        const buffer = await context.startRendering();
        const data = buffer.getChannelData(0);
        
        // Get a few samples for fingerprinting
        let result = '';
        for (let i = 4500; i < 5000; i += 100) {
            result += data[i].toFixed(5);
        }
        return result;
    } catch (e) {
        return 'Not available';
    }
}

async function generateFingerprints() {
    const canvasData = getCanvasFingerprint();
    const canvasHash = canvasData !== 'Not available' ? cyrb53(canvasData).substring(0, 16) : 'N/A';
    document.getElementById('canvas-fp').textContent = canvasHash;
    
    const webglData = getWebGLFingerprint();
    const webglHash = webglData !== 'Not available' ? cyrb53(webglData).substring(0, 16) : 'N/A';
    document.getElementById('webgl-fp').textContent = webglHash;
    
    const audioData = await getAudioFingerprint();
    const audioHash = audioData !== 'Not available' ? cyrb53(audioData).substring(0, 16) : 'N/A';
    document.getElementById('audio-fp').textContent = audioHash;
    
    const combined = canvasHash + webglHash + audioHash + navigator.userAgent;
    document.getElementById('combined-fp').textContent = cyrb53(combined).substring(0, 20);
}

function getWebGLInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            document.getElementById('webgl-vendor').textContent = 'Not available';
            document.getElementById('webgl-renderer').textContent = 'Not available';
            return;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            document.getElementById('webgl-vendor').textContent = 'Vendor: ' + gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            document.getElementById('webgl-renderer').textContent = 'Renderer: ' + gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } else {
            document.getElementById('webgl-vendor').textContent = 'Vendor: ' + gl.getParameter(gl.VENDOR);
            document.getElementById('webgl-renderer').textContent = 'Renderer: ' + gl.getParameter(gl.RENDERER);
        }
    } catch (e) {
        document.getElementById('webgl-vendor').textContent = 'Not available';
        document.getElementById('webgl-renderer').textContent = 'Not available';
    }
}

function getBatteryInfo() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            const level = Math.round(battery.level * 100);
            const charging = battery.charging ? '⚡ Charging' : '🔋 Discharging';
            document.getElementById('battery').textContent = level + '% - ' + charging;
        }).catch(() => {
            document.getElementById('battery').textContent = 'Not available';
        });
    } else {
        document.getElementById('battery').textContent = 'Not available';
    }
}

function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const type = conn.effectiveType || 'Unknown';
        const downlink = conn.downlink ? conn.downlink + ' Mbps' : 'Unknown';
        const rtt = conn.rtt ? conn.rtt + ' ms' : 'Unknown';
        document.getElementById('network').textContent = 'Type: ' + type + ' | Downlink: ' + downlink + ' | RTT: ' + rtt;
    } else {
        document.getElementById('network').textContent = 'Not available';
    }
}

function getPlugins() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
    }
    document.getElementById('plugins').textContent = plugins.length > 0 ? plugins.join(', ') : 'None detected';
}

function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const detected = [];
    const fontsToTest = ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'];
    
    canvas.width = 200;
    canvas.height = 100;
    
    for (const font of fontsToTest) {
        ctx.font = testSize + ' ' + baseFonts[0];
        const baselineWidth = ctx.measureText(testString).width;
        
        ctx.font = testSize + ' "' + font + '", ' + baseFonts[0];
        const testWidth = ctx.measureText(testString).width;
        
        if (testWidth !== baselineWidth) {
            detected.push(font);
        }
    }
    
    document.getElementById('fonts').textContent = detected.length > 0 ? detected.join(', ') + '...' : 'Basic fonts only';
}
