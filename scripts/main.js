
/**
 * Resets admin-related state so the player returns to normal privileges.
 * Called when exiting the MUTHUR session (Option A).
 */
function resetAdminState() {
  try {
    if (typeof hackSuccessful !== 'undefined') {
      hackSuccessful = false;
    }
    // TODO: If you track other admin UI states, clear them here as well.
    // e.g., remove badges, timers, overlays, etc.
  } catch (e) {
    console.error('resetAdminState error:', e);
  }
}

import gsap from "/scripts/greensock/esm/all.js";

console.error("lancement de muthur");
let currentReplySound = null;
let shouldContinueReplySound = false;
let socket;
let cerberusCountdownInterval = null;
let hackSuccessful = false;  // Ajoutez cette ligne
let currentMuthurSession = {
    active: false,
    userId: null,
    userName: null
};
let currentGMProgress = null;

// AprÃ¨s les variables globales


async function showBootSequence() {
    // CrÃ©er le conteneur principal
    const bootContainer = document.createElement('div');
    bootContainer.id = 'muthur-boot-sequence';
    bootContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        color: #00ff00;
        font-family: monospace;
        z-index: 999999;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Conteneur pour le contenu
    const content = document.createElement('div');
    content.style.cssText = `
        width: 80%;
        max-width: 800px;
        position: relative;
    `;
    bootContainer.appendChild(content);

    // NOUVEAU : Ajout du logo en arriÃ¨re-plan
    const backgroundLogo = document.createElement('div');
    backgroundLogo.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: -1;
    `;

 backgroundLogo.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        <g class="logo-group">
            <text x="400" y="100" text-anchor="middle" class="logo-text" 
                style="fill: #00ff00; font-size: 48px; font-family: Arial;">WEYLAND-YUTANI CORP</text>
            <path class="logo-path" 
                d="M 200,150 L 350,150 L 400,250 L 450,150 L 600,150" 
                fill="none" 
                stroke="#00ff00" 
                stroke-width="4"
                stroke-dasharray="1000"
                stroke-dashoffset="1000"/>
            <text x="400" y="300" text-anchor="middle" class="logo-slogan"
                style="fill: #00ff00; font-size: 36px; font-family: Arial;">"Building Better Worlds"</text>
        </g>
    </svg>
`;

bootContainer.appendChild(backgroundLogo);

// ✅ define logoPath antes de animar
const logoPath = backgroundLogo.querySelector('.logo-path');

gsap.timeline()
    .to(backgroundLogo, {
        opacity: 0.15,
        duration: 2,
        ease: 'power2.inOut'
    })
    .to(logoPath, {
        strokeDashoffset: 0,
        duration: 3,
        ease: 'power2.inOut',
        repeat: -1,
        repeatDelay: 1,
        onRepeat: () => {
            gsap.set(logoPath, { strokeDashoffset: 1000 });
        }
    }, '-=1')
    .to(logoPath, {
        filter: 'drop-shadow(0 0 8px #00ff00)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
    });
    // Logo Weyland-Yutani
    const logo = document.createElement('div');
    logo.innerHTML = `
         <pre style="color: #00ff00; font-size: 14px; line-height: 1.2; text-align: center; font-weight: bold;">
██     ██ ███████ ██    ██ ██       █████  ███    ██ ██████      ██    ██ ██    ██ ████████  █████  ███    ██ ██ 
██     ██ ██       ██  ██  ██      ██   ██ ████   ██ ██   ██      ██  ██  ██    ██    ██    ██   ██ ████   ██ ██ 
██  █  ██ █████     ████   ██      ███████ ██ ██  ██ ██   ██       ████   ██    ██    ██    ███████ ██ ██  ██ ██ 
██ ███ ██ ██         ██    ██      ██   ██ ██  ██ ██ ██   ██        ██    ██    ██    ██    ██   ██ ██ ██  ██ ██
 ███ ███  ███████    ██    ███████ ██   ██ ██   ████ ██████         ██     ██████     ██    ██   ██ ██   ████ ██ 
    </pre>
`;
    content.appendChild(logo);

    document.body.appendChild(bootContainer);

    // Effet de scanline
    const scanline = document.createElement('div');
    scanline.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba(0, 255, 0, 0.2);
        pointer-events: none;
        z-index: 1000;
    `;
    bootContainer.appendChild(scanline);

    // Animation du scanline
    gsap.to(scanline, {
        top: '100%',
        duration: 2,
        repeat: -1,
        ease: 'none'
    });

    const crtOverlay = document.createElement('div');
    crtOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: 
            linear-gradient(rgba(18, 16, 16, 0.1) 50%, rgba(0, 255, 0, 0.08) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.1), rgba(0, 255, 0, 0.05), rgba(0, 0, 255, 0.1));
        background-size: 100% 3px, 3px 100%;
        pointer-events: none;
        z-index: 1000;
        animation: flicker 0.15s infinite;
        mix-blend-mode: screen;
        opacity: 0.5;
    `;

    // Animation de scintillement plus subtile
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    @keyframes flicker {
        0% { opacity: 0.5; }
        25% { opacity: 0.45; }
        50% { opacity: 0.5; }
        75% { opacity: 0.45; }
        100% { opacity: 0.5; }
    }
`;
    document.head.appendChild(styleSheet);

    // Vignette ajustÃ©e
    const vignette = document.createElement('div');
    vignette.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle, transparent 40%, rgba(0, 255, 0, 0.1) 100%);
        pointer-events: none;
        z-index: 999;
        mix-blend-mode: screen;
    `;

    bootContainer.appendChild(vignette);
    bootContainer.appendChild(crtOverlay);

    // SÃ©quence de dÃ©marrage
    const bootMessages = [
        'INITIALIZING MU/TH/UR 6000...',
        'LOADING CORE SYSTEMS...',
        'CHECKING MEMORY BANKS...',
        'INITIALIZING NEURAL NETWORKS...',
        'LOADING COMMAND PROTOCOLS...',
        'CHECKING LIFE SUPPORT SYSTEMS...',
        'INITIALIZING SECURITY PROTOCOLS...',
        'CONNECTING TO WEYLAND-YUTANI NETWORK...',
        'SYSTEM READY',
        'MUTHUR 6000 ONLINE',
        'INTERFACE 2037 READY'
    ];

    // Conteneur pour les messages
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        margin-top: 2em;
        font-size: 24px;         
        line-height: 1.5;
        text-align: center;
        width: 100%;
        font-weight: bold;
    `;
    content.appendChild(messageContainer);

    // Animation du logo
    gsap.from(logo, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut'
    });

    // Affichage progressif des messages
    for (let i = 0; i < bootMessages.length; i++) {
        const messageElement = document.createElement('div');
        messageElement.style.opacity = '0';
        messageElement.style.cssText = `
            opacity: 0;
            margin: 0.5em 0;     // Espacement vertical entre les messages
            text-shadow: 0 0 5px #00ff00;  // Effet de lueur verte
        `;
        messageElement.innerHTML = `${bootMessages[i]}`; // Suppression du '>' pour un look plus propre
        messageContainer.appendChild(messageElement);

        // Augmentation du dÃ©lai Ã  800ms (Ã©tait 300ms)
        await new Promise(resolve => setTimeout(resolve, 800));

        gsap.to(messageElement, {
            opacity: 1,
            // Augmentation de la durÃ©e Ã  1s (Ã©tait 0.5s)
            duration: 1,
            onComplete: () => {
                if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
                    playComSound();
                }
            }
        });

        // Effet de glitch alÃ©atoire
        if (Math.random() > 0.7) {
            gsap.to(messageElement, {
                skewX: "20deg",
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        }
    }

   

    // ... existing code ...

    // Remplacer l'animation finale par celle-ci
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Effet de "power down" style terminal rÃ©tro
    gsap.to(content, {
        height: '2px',
        duration: 0.4,
        ease: 'power1.in',
        onComplete: () => {
            // Flash final et disparition
            gsap.to(bootContainer, {
                background: '#0f0',
                duration: 0.1,
                onComplete: () => {
                    gsap.to(bootContainer, {
                        background: 'black',
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            bootContainer.remove();
                            showMuthurInterface();
                            // Envoyer un message au GM pour ouvrir son interface
                            if (!game.user.isGM) {
                                sendToGM(game.i18n.localize("MUTHUR.sessionStarted"), 'open');
                            }
                        }
                    });
                }
            });
        }
    });
}


function startCerberusCountdown() {
    const duration = game.settings.get('alien-mu-th-ur', 'cerberusDuration');
    let timeLeft = duration * 60; // Convertir les minutes en secondes


    cerberusCountdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Mettre Ã  jour les deux affichages
        const chatCountdown = document.querySelector('.cerberus-countdown');
        const floatingCountdown = document.getElementById('cerberus-floating-countdown');

        if (chatCountdown) chatCountdown.textContent = countdownText;
        if (floatingCountdown) floatingCountdown.textContent = countdownText;

        // Jouer les sons du compte Ã  rebours final
        if (timeLeft <= 10 && timeLeft > 0) {
            const audio = new Audio(`modules/alien-mu-th-ur/sounds/count/${timeLeft}.mp3`);
            audio.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
            audio.play();
        }

        // Dans l'intervalle de compte Ã  rebours
        if (timeLeft % 30 === 0 && game.user.isGM) {
            // PrÃ©parer les labels corrects
            const minuteLabel = minutes === 1 ?
                game.i18n.localize("MUTHUR.Time.Minute") :
                game.i18n.localize("MUTHUR.Time.Minutes");

            const secondLabel = seconds === 1 ?
                game.i18n.localize("MUTHUR.Time.Second") :
                game.i18n.localize("MUTHUR.Time.Seconds");

            // CrÃ©er le message appropriÃ©
            let timeMessage;
            if (minutes > 0) {
                timeMessage = game.i18n.format("MUTHUR.Time.MinutesAndSeconds", {
                    minutes: minutes,
                    minuteLabel: minuteLabel,
                    seconds: seconds,
                    secondLabel: secondLabel
                });
            } else {
                timeMessage = game.i18n.format("MUTHUR.Time.OnlySeconds", {
                    seconds: seconds,
                    secondLabel: secondLabel
                });
            }

            // Jouer le son de notification
            if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
                const audio = new Audio('modules/alien-mu-th-ur/sounds/pec_message/error.wav');
                audio.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
                audio.play();
            }

            // Envoyer le message avec la couleur rouge
            ChatMessage.create({
                content: `<span style="color: #ff0000; font-weight: bold;">${game.i18n.format("MOTHER.SpecialOrders.Cerberus.TimeRemaining", {
                    time: timeMessage
                })}</span>`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                speaker: { alias: "MUTHUR 6000" }
            });
        }

        if (timeLeft <= 0) {
            clearInterval(cerberusCountdownInterval);

            // Fermer la fenÃªtre principale Cerberus
            const cerberusWindow = document.getElementById('cerberus-floating-window');
            console.log("FenÃªtre principale Cerberus trouvÃ©e:", cerberusWindow ? "oui" : "non");

            if (cerberusWindow) {
                cerberusWindow.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    cerberusWindow.remove();
                    console.log("FenÃªtre principale Cerberus supprimÃ©e");
                }, 500);
            }

            // Nettoyer les Ã©lÃ©ments restants
            const remainingElements = document.querySelectorAll('[class*="cerberus"]');
            remainingElements.forEach(element => {
                element.remove();
            });

            // RÃ©initialiser l'Ã©tat de la session
            currentMuthurSession.active = false;
            currentMuthurSession.userId = null;
            currentMuthurSession.userName = null;

            setTimeout(() => {
                playEndSequence();
            }, 600);
        }
    }, 1000);

    return cerberusCountdownInterval;
}
function createFullScreenGlitch() {
    const glitchOverlay = document.createElement('div');
    glitchOverlay.id = 'muthur-glitch-overlay';
    glitchOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999;
        mix-blend-mode: difference;
        opacity: 0;
    `;
    document.body.appendChild(glitchOverlay);
    return glitchOverlay;
}

const glitchEffect = async () => {
    // Cibler spÃ©cifiquement l'application Foundry
    const gameCanvas = document.getElementById('board');
    const uiLayer = document.getElementById('ui-top');

    if (Math.random() > 0.7) { // 30% de chance d'avoir un glitch majeur
        const effects = [
            // Ã‰cran noir total
            async () => {
                const blackout = document.createElement('div');
                blackout.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    z-index: 999999;
                    pointer-events: none;
                `;
                document.body.appendChild(blackout);
                await new Promise(resolve => setTimeout(resolve, 150));
                blackout.remove();
            },

            // Effet de dÃ©placement vertical
            async () => {
                if (gameCanvas) {
                    gameCanvas.style.transform = `translateY(${Math.random() * 300 - 150}px)`;
                    await new Promise(resolve => setTimeout(resolve, 100));
                    gameCanvas.style.transform = '';
                }
            },

            // Effet de distorsion
            async () => {
                if (gameCanvas) {
                    gameCanvas.style.filter = 'brightness(2) contrast(3) hue-rotate(90deg)';
                    await new Promise(resolve => setTimeout(resolve, 80));
                    gameCanvas.style.filter = '';
                }
            },

            // Effet de dÃ©coupage horizontal
            async () => {
                const slice = document.createElement('div');
                const height = Math.random() * 100 + 50;
                const top = Math.random() * (window.innerHeight - height);
                slice.style.cssText = `
                    position: fixed;
                    top: ${top}px;
                    left: 0;
                    width: 100%;
                    height: ${height}px;
                    background: black;
                    z-index: 999999;
                    pointer-events: none;
                `;
                document.body.appendChild(slice);
                await new Promise(resolve => setTimeout(resolve, 120));
                slice.remove();
            }
        ];

        // ExÃ©cuter un effet alÃ©atoire
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        await randomEffect();
    }
};

// Fonction d'envoi modifiÃ©e
function sendToGM(message, actionType = 'command') {


    if (!game.socket) {
        console.error("Socket non disponible!");
        return;
    }

    try {
        // Utilisation de game.socket.emit avec le nom correct du module
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'muthurCommand',
            command: message,
            user: game.user.name,
            userId: game.user.id,
            actionType: actionType,
            timestamp: Date.now() // Ajout d'un timestamp pour le suivi
        });

    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        ui.notifications.error("Erreur de communication avec MUTHUR");
    }
}

Hooks.once('init', () => {
    // Enregistrement du module
    game.modules.get('alien-mu-th-ur').api = {
        version: "1.0.0"
    };

    // PrÃ©chargement des traductions
    game.i18n.translations = game.i18n.translations || {};

    // DÃ©finir les traductions par dÃ©faut
    CONFIG.MUTHUR = {
        translations: {}
    };

    // DÃ©finition des sÃ©quences globales
    window.hackingSequences = [
        "> INITIALISATION BRUTE FORCE ATTACK...",
        "ssh -p 22 root@muthur6000.weyland-corp",
        "TRYING PASSWORD COMBINATIONS..."
    ];

    window.postPasswordSequences = [
        "PASSWORD FOUND: ********",
        "ACCESS GRANTED TO PRIMARY SYSTEMS",
        "> SWITCHING TO DICTIONARY ATTACK FOR SECONDARY SYSTEMS",
        "ATTEMPTING BYPASS OF SECURITY PROTOCOLS",
        "ACCESSING MAIN COMPUTER..."
    ];

    window.successSequences = [
        { text: game.i18n.localize('MOTHER.IntrusionDetected'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.SecurityProtocol'), color: '#ff9900', type: 'error' },
        { text: game.i18n.localize('MOTHER.CountermeasuresAttempt'), color: '#00ff00', type: 'reply' },
        { text: game.i18n.localize('MOTHER.CountermeasuresFailed'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.RootAccess'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.AdminPrivileges'), color: '#00ff00', type: 'reply' },
        { text: game.i18n.localize('MOTHER.SecurityDisabled'), color: '#00ff00', type: 'reply' },
        { text: game.i18n.localize('MOTHER.FullAccess'), color: '#00ff00', type: 'reply' },
        { text: game.i18n.localize('MOTHER.WelcomeAdmin'), color: '#00ff00', type: 'reply' }
    ];

    window.failureSequences = [
        { text: game.i18n.localize('MOTHER.IntrusionDetected'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.SecurityProtocol'), color: '#ff9900', type: 'error' },
        { text: game.i18n.localize('MOTHER.CountermeasuresActivated'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.TerminalLocked'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.LocatingIntruder'), color: '#ff9900', type: 'reply' },
        { text: game.i18n.localize('MOTHER.IPRecorded'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.AccessBlocked'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.TerminalLocked24'), color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.ForcedDisconnect3'), color: '#ff0000', type: 'error' },
        { text: "2...", color: '#ff0000', type: 'error' },
        { text: "1...", color: '#ff0000', type: 'error' },
        { text: game.i18n.localize('MOTHER.ConnectionTerminated'), color: '#ff0000', type: 'error' }
    ];

    // Ajouter le paramÃ¨tre pour activer/dÃ©sactiver le son
    game.settings.register('alien-mu-th-ur', 'enableTypingSounds', {
        name: game.i18n.localize("MUTHUR.SETTINGS.typingSound.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.typingSound.hint"),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            console.log("Sons de frappe:", value ?
                game.i18n.localize("MUTHUR.SETTINGS.typingSound.enable") :
                game.i18n.localize("MUTHUR.SETTINGS.typingSound.disable")
            );
        }
    });



    // Ajouter le paramÃ¨tre pour le volume
    game.settings.register('alien-mu-th-ur', 'typingSoundVolume', {
        name: game.i18n.localize("MUTHUR.SETTINGS.typingSoundVolume.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.typingSoundVolume.hint"),
        scope: 'client',
        config: true,
        type: Number,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        },
        default: 0.2
    });

    // Scanline
    game.settings.register('alien-mu-th-ur', 'enableScanline', {
        name: game.i18n.localize("MUTHUR.SETTINGS.scanline.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.scanline.hint"),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            console.log("Effet scanline:", value ?
                game.i18n.localize("MUTHUR.SETTINGS.scanline.enable") :
                game.i18n.localize("MUTHUR.SETTINGS.scanline.disable")
            );
        }
    });

    // taille scanline
    game.settings.register('alien-mu-th-ur', 'scanlineSize', {
        name: game.i18n.localize("MUTHUR.SETTINGS.scanlineSize.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.scanlineSize.hint"),
        scope: 'client',
        config: true,
        type: Number,
        range: {
            min: 10,
            max: 100,
            step: 5
        },
        default: 30,
        onChange: value => {
            console.log("Taille du scanline:", value);
        }
    });

    // Enregistrer les paramÃ¨tres du module
    game.settings.register('alien-mu-th-ur', 'enableTypewriter', {
        name: game.i18n.localize("MUTHUR.SETTINGS.typewriter.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.typewriter.hint"),
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            console.log("Effet typewriter:", value ?
                game.i18n.localize("MUTHUR.SETTINGS.typewriter.enable") :
                game.i18n.localize("MUTHUR.SETTINGS.typewriter.disable")
            );
        }
    });

    game.settings.register('alien-mu-th-ur', 'allowHack', {
        name: game.i18n.localize("MUTHUR.SETTINGS.allowHack.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.allowHack.hint"),
        scope: 'world',     // 'world' signifie que seul le GM peut le modifier
        config: true,       // Visible dans le menu des paramÃ¨tres
        type: Boolean,
        default: true,      // ActivÃ© par dÃ©faut
        restricted: true    // Seul le GM peut le modifier
    });

    game.settings.register('alien-mu-th-ur', 'hackResult', {
        name: game.i18n.localize("MUTHUR.SETTINGS.hackResult.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.hackResult.hint"),
        scope: 'world',     // Seul le GM peut le modifier
        config: true,       // Visible dans le menu des paramÃ¨tres
        type: String,
        choices: {
            "random": "MUTHUR.SETTINGS.hackResult.random",
            "success": "MUTHUR.SETTINGS.hackResult.success",
            "failure": "MUTHUR.SETTINGS.hackResult.failure",
            "ask": "MUTHUR.SETTINGS.hackResult.ask"
        },
        default: "random",
        restricted: true    // Seul le GM peut le modifier
    });

    // Ajouter le paramÃ¨tre pour activer/dÃ©sactiver Cerberus
    game.settings.register('alien-mu-th-ur', 'allowCerberus', {
        name: game.i18n.localize("MUTHUR.SETTINGS.allowCerberus.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.allowCerberus.hint"),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });


    // AprÃ¨s game.settings.register('alien-mu-th-ur', 'allowHack', ...)
    game.settings.register('alien-mu-th-ur', 'cerberusDuration', {
        name: game.i18n.localize("MUTHUR.SETTINGS.cerberusDuration.name"),
        hint: game.i18n.localize("MUTHUR.SETTINGS.cerberusDuration.hint"),
        scope: 'world',     // 'world' signifie que seul le GM peut le modifier
        config: true,       // Visible dans le menu des paramÃ¨tres
        type: Number,
        range: {
            min: 1,
            max: 60,
            step: 1
        },
        default: 5,      // 5 minutes par dÃ©faut
        restricted: true    // Seul le GM peut le modifier
    });
});


// Ajouter une fonction pour mettre Ã  jour les couleurs
window.MUTHUR = window.MUTHUR || {};
window.MUTHUR.updateColors = () => {
    const motherColor = game.settings.get('alien-mu-th-ur', 'motherResponseColor');
    // Mettre Ã  jour les messages existants de MAMAN
    const mamanMessages = document.querySelectorAll('.muthur-chat-log div');
    mamanMessages.forEach(msg => {
        if (msg.textContent.startsWith('/M')) {
            msg.style.color = motherColor;
        }
    });
};


// Fonction pour l'effet de typing rÃ©tro
async function typeWriterEffect(element, text, speed = 30) {
    element.textContent = '';
    let currentText = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

    // VÃ©rifier si les sons sont activÃ©s
    const soundEnabled = game.settings.get('alien-mu-th-ur', 'enableTypingSounds');

    for (let i = 0; i < text.length; i++) {
        // Effet de "scramble" avant d'afficher la vraie lettre
        for (let j = 0; j < 3; j++) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            element.textContent = currentText + randomChar;



            await new Promise(resolve => setTimeout(resolve, speed / 3));
        }

        // Ajoute la vraie lettre au texte courant
        currentText += text[i];
        element.textContent = currentText;



        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// Modifier la fonction qui affiche les messages

async function displayMuthurMessage(chatLog, text, prefix = '', color = '#00ff00', messageType = 'normal') {
    const messageDiv = document.createElement('div');
    messageDiv.style.color = color;
    messageDiv.style.position = 'relative';
    messageDiv.style.minHeight = '25px';
    chatLog.appendChild(messageDiv);

    const typewriterEnabled = game.settings.get('alien-mu-th-ur', 'enableTypewriter');
    const soundEnabled = game.settings.get('alien-mu-th-ur', 'enableTypingSounds');
    const scanlineEnabled = game.settings.get('alien-mu-th-ur', 'enableScanline');

    try {
        if (soundEnabled) {
            switch (messageType) {
                case 'error':
                    await playErrorSound();
                    break;
                case 'communication':
                    await playComSound();
                    break;
                case 'reply':
                    shouldContinueReplySound = true;
                    await playReplySound();
                    break;
                case 'normal':
                    await playReturnSound();
                    break;
            }
        }

        // Afficher le message
        if (typewriterEnabled) {
            // Pour chaque ligne du message
            const lines = (prefix + text).split('\n');
            for (let i = 0; i < lines.length; i++) {
                const lineDiv = document.createElement('div');
                lineDiv.style.position = 'relative';
                messageDiv.appendChild(lineDiv);

                // Effet scanline pour chaque ligne
                // Dans displayMuthurMessage, dans la partie scanline
                if (scanlineEnabled) {
                    const scanlineSize = game.settings.get('alien-mu-th-ur', 'scanlineSize');
                    const lineScanline = document.createElement('div');
                    lineScanline.style.cssText = `
        position: absolute;
        width: ${scanlineSize}px;
        height: 25px;
        background: radial-gradient(circle, ${color} 50%, rgba(${hexToRgb(color)}, 0.7) 70%, transparent 90%);
        left: 100%;
        top: 0;
        filter: blur(2px) brightness(1.5);
        opacity: 1;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
    `;
                    lineDiv.appendChild(lineScanline);

                    await new Promise(resolve => {
                        lineScanline.animate([
                            { left: '100%', filter: 'blur(2px) brightness(1.5)' },
                            { left: `-${scanlineSize}px`, filter: 'blur(3px) brightness(2)' }
                        ], {
                            duration: 200,
                            easing: 'linear'
                        }).onfinish = () => {
                            lineScanline.remove();
                            resolve();
                        };
                    });
                }

                await typeWriterEffect(lineDiv, lines[i], 30);
            }
        } else {
            messageDiv.textContent = prefix ? prefix + text : text;
        }

        if (messageType === 'reply') {
            stopReplySound();
        }
    } catch (error) {
        console.error("Erreur d'affichage:", error);
        messageDiv.textContent = prefix ? prefix + text : text;
        if (messageType === 'reply') {
            stopReplySound();
        }
    }

    chatLog.scrollTop = chatLog.scrollHeight;
    return messageDiv;
}

// Fonction utilitaire pour convertir une couleur hex en RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '255, 255, 255';
}

function showMuthurInterface() {
    const existingChat = document.getElementById('muthur-chat-container');
    if (existingChat) {
        return existingChat;
    }

    // VÃ©rifier si une session est dÃ©jÃ  active
    const container = document.createElement('div');
    container.id = 'muthur-chat-container';
    if (currentMuthurSession.active && currentMuthurSession.userId !== game.user.id) {
        ui.notifications.warn(game.i18n.format("MUTHUR.sessionActiveWarning", { userName: currentMuthurSession.userName }));
        return;
    }

    // Si c'est une nouvelle session, mettre Ã  jour l'Ã©tat
    if (!currentMuthurSession.active) {
        currentMuthurSession.active = true;
        currentMuthurSession.userId = game.user.id;
        currentMuthurSession.userName = game.user.name;

        // Informer tous les autres clients qu'une session est active
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'sessionStatus',
            active: true,
            userId: game.user.id,
            userName: game.user.name
        });
    }

    const chatContainer = document.createElement('div');
    chatContainer.id = 'muthur-chat-container';

    // Calcul de la position en fonction de la sidebar
    const sidebar = document.getElementById('sidebar');
    const rightPosition = sidebar ? `${sidebar.offsetWidth + 20}px` : '320px';

    chatContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: ${rightPosition};
        width: 400px;
        height: 600px;
        background: black;
        border: 2px solid #00ff00;
        padding: 10px;
        font-family: monospace;
        z-index: 100000;
        display: flex;
        flex-direction: column;
    `;
    const chatLog = document.createElement('div');
    chatLog.className = 'muthur-chat-log';
    chatLog.style.cssText = `
        flex: 1;
        overflow-y: auto;
        margin-bottom: 10px;
        font-family: monospace;
        padding: 5px;
        background: rgba(0, 0, 0, 0.8);
    `;

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
        display: flex;
        gap: 5px;
        width: 100%;
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = game.i18n.localize("MUTHUR.inputPlaceholder");
    input.style.cssText = `
        flex: 1;
        background: black;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 5px;
        font-family: monospace;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = game.i18n.localize("MUTHUR.send");
    sendButton.style.cssText = `
        background: black;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 5px;
        cursor: pointer;
        font-family: monospace;
        height: 24px;
        line-height: 14px;
        font-size: 12px;
        min-width: 50px;
        width: 110px;
    `;

    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);

    chatContainer.appendChild(chatLog);
    chatContainer.appendChild(inputContainer);
    document.body.appendChild(chatContainer);

    // Afficher le message de bienvenue
    displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.welcome"), '', '#00ff00', 'reply');


    // Gestionnaire d'Ã©vÃ©nements pour l'entrÃ©e
    // Fonction commune de traitement
    async function handleCommand() {
        if (input.value.trim()) {
            const command = input.value.trim().toUpperCase();
            input.value = '';
            await displayMuthurMessage(chatLog, command, '> ');
            chatLog.scrollTop = chatLog.scrollHeight;

            const motherPrefix = "/M";

            // VÃ©rifier si c'est une commande d'ordre spÃ©cial
            const orderWords = [
                game.i18n.localize('MOTHER.Keywords.Ordre').toUpperCase(),
                'ORDER' // Toujours disponible en anglais
            ];
            const specialWords = [
                game.i18n.localize('MOTHER.Keywords.Special').toUpperCase(),
                game.i18n.localize('MOTHER.Keywords.Special2').toUpperCase()
            ];
            const protocolWords = [
                game.i18n.localize('MOTHER.Keywords.Protocol').toUpperCase(),
                'PROTOCOL' // Toujours disponible en anglais
            ];

            // Fonction pour vÃ©rifier si c'est un numÃ©ro valide
            const isValidNumber = (num) => /^(937|938|939|\d{3})$/.test(num);

            // VÃ©rifier les diffÃ©rents formats possibles
            const isSpecialOrder = (cmd) => {
                const words = cmd.split(/\s+/);

                if (words.length === 1) {
                    // Format: "937"
                    return isValidNumber(words[0]);
                } else if (words.length === 2) {
                    // Format: "ORDRE 937" ou "SPECIAL 937"
                    return (orderWords.includes(words[0]) || specialWords.includes(words[0])) &&
                        isValidNumber(words[1]);
                } else if (words.length === 3) {
                    // Format: "ORDRE SPECIAL 937" ou "SPECIAL ORDRE 937"
                    return ((orderWords.includes(words[0]) && specialWords.includes(words[1])) ||
                        (specialWords.includes(words[0]) && orderWords.includes(words[1]))) &&
                        isValidNumber(words[2]);
                }
                return false;
            };

            // VÃ©rifier si c'est Cerberus
            const isCerberus = (cmd) => {
                const words = cmd.split(/\s+/);
                return words.includes('CERBERUS') ||
                    (words.length === 2 && protocolWords.includes(words[0]) && words[1] === 'CERBERUS');
            };

            // Dans showMuthurInterface, dans la fonction handleCommand, remplacer :
            // Dans showMuthurInterface, dans handleCommand
            if (isSpecialOrder(command) || isCerberus(command)) {
                if (!hackSuccessful) {
                    await displayMuthurMessage(
                        chatLog,
                        game.i18n.localize('MOTHER.AccessDenied'),
                        '',
                        '#ff0000',
                        'error'
                    );

                    // Envoyer la tentative au GM
                    if (!game.user.isGM) {
                        sendToGM(game.i18n.format("MUTHUR.SpecialOrderAttempt", { command: command }));
                    }

                    if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
                        playErrorSound();
                    }
                    return;
                }

                await handleSpecialOrder(chatLog, command);
                return;
            }



            if (command.startsWith(motherPrefix)) {

                const message = command.substring(motherPrefix.length).trim();
                await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.waitingResponse"), '', '#00ff00', 'communication');
                chatLog.scrollTop = chatLog.scrollHeight;

                if (!game.user.isGM) {
                    sendToGM(message);
                }
                return;
            } else if (!game.user.isGM) {
                sendToGM(command);
            }

            // DÃ©lai avant la rÃ©ponse
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (command) {
                case 'HACK':
                    if (!game.settings.get('alien-mu-th-ur', 'allowHack') && !game.user.isGM) {
                        // Pour le joueur, afficher le message standard de commande non reconnue
                        await displayMuthurMessage(
                            chatLog,
                            game.i18n.localize("MUTHUR.commandNotFound"),
                            '',
                            '#00ff00',
                            'error'
                        );

                        // Envoyer l'information au GM via sendToGM
                        sendToGM(game.i18n.localize("MOTHER.HackDisabledInfo"), 'hack');
                    } else {
                        // Lancer directement la simulation sans envoyer de message supplÃ©mentaire
                        await simulateHackingAttempt(chatLog);
                    }
                    return; // EmpÃªche l'envoi d'une commande non reconnue
                    break;
                case 'HELP':
                    await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.help"), '', '#00ff00', 'reply');
                    break;
                case 'STATUS':
                    await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.status"), '', '#00ff00', 'reply');
                    break;
                case 'CLEAR':
                    chatLog.innerHTML = '';
                    if (hackSuccessful) {
                        await displayMuthurMessage(chatLog, game.i18n.localize("MOTHER.WelcomeAdminFull"), '', '#00ff00', 'reply');
                    } else {
                        await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.welcome"), '', '#00ff00', 'reply');
                    }
                    break;
                case 'EXIT':
                      // Option A: reset admin status on EXIT so player can hack again next time
  resetAdminState();
await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.sessionEnded"), '', '#00ff00', 'reply');
                    setTimeout(() => {
                        // Utiliser document.getElementById au lieu de la variable container
                        const muthurContainer = document.getElementById('muthur-chat-container');
                        if (muthurContainer) {
                            muthurContainer.remove();
                        }

                        // RÃ©initialiser l'Ã©tat de la session
                        if (currentMuthurSession.userId === game.user.id) {
                            currentMuthurSession.active = false;
                            currentMuthurSession.userId = null;
                            currentMuthurSession.userName = null;

                            // Informer tous les autres clients que la session est terminÃ©e
                            game.socket.emit('module.alien-mu-th-ur', {
                                type: 'sessionStatus',
                                active: false
                            });
                        }
                    }, 1000);
                    if (!game.user.isGM) {
                        sendToGM(game.i18n.localize("MUTHUR.sessionEnded"), 'close');
                    }
                    return;
                default:
                    if (!command.startsWith(motherPrefix)) {
                        await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.commandNotFound"), '', '#00ff00', 'error');
                    }
            }
        }
    };

    // Gestionnaire pour les touches
    input.addEventListener('keypress', async (event) => {
        const soundEnabled = game.settings.get('alien-mu-th-ur', 'enableTypingSounds');
        if (soundEnabled) { playTypeSound(); }

        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
            await handleCommand();
        }
    });

    // Gestionnaire pour le bouton
    sendButton.addEventListener('click', handleCommand);

    return chatContainer;
}

function toggleMuthurChat() {
    let chatContainer = document.getElementById('muthur-chat-container');

    // Si une fenÃªtre existe dÃ©jÃ , la fermer
    if (chatContainer) {
        chatContainer.remove();
        if (currentMuthurSession.userId === game.user.id) {
            currentMuthurSession.active = false;
            currentMuthurSession.userId = null;
            currentMuthurSession.userName = null;

            game.socket.emit('module.alien-mu-th-ur', {
                type: 'sessionStatus',
                active: false
            });
        }
        if (!game.user.isGM) {
            sendToGM(game.i18n.localize("MUTHUR.sessionEnded"), 'close');
        }
        return;
    }

    // VÃ©rifier si une session est active avant d'en crÃ©er une nouvelle
    if (currentMuthurSession.active && currentMuthurSession.userId !== game.user.id) {
        ui.notifications.warn(game.i18n.format("MUTHUR.sessionActiveWarning", { userName: currentMuthurSession.userName }));
        return;
    }

    // DiffÃ©rencier le comportement GM/Joueur
    if (game.user.isGM) {
        showMuthurInterface();
    } else {

        showBootSequence();
        // const videoContainer = document.createElement('div');
        // videoContainer.style.cssText = `
        //     position: fixed;
        //     top: 50%;
        //     left: 50%;
        //     transform: translate(-50%, -50%);
        //     z-index: 100001;
        //     background: black;
        //     padding: 0;
        //     border: 2px solid #00ff00;
        // `;

        // const video = document.createElement('video');
        // video.style.cssText = `
        //     max-width: 800px;
        //     max-height: 600px;
        // `;
        // video.src = 'modules/alien-mu-th-ur/movies/Muthur.mp4';
        // video.autoplay = true;
        // video.muted = false;

        // videoContainer.appendChild(video);
        // document.body.appendChild(videoContainer);

        // const startSession = () => {
        //     videoContainer.remove();
        //     showMuthurInterface();
        //     sendToGM(game.i18n.localize("MUTHUR.sessionStarted"), 'open');
        // };

        // video.addEventListener('ended', startSession);
        // video.addEventListener('error', () => {
        //     console.error("Erreur de chargement de la vidÃ©o MUTHUR");
        //     startSession();
        // });

        // const skipButton = document.createElement('div');
        // skipButton.textContent = game.i18n.localize("MUTHUR.skip");
        // skipButton.style.cssText = `
        //     position: absolute;
        //     bottom: 10px;
        //     right: 10px;
        //     color: #00ff00;
        //     border: 1px solid #00ff00;
        //     padding: 5px 10px;
        //     cursor: pointer;
        //     font-family: monospace;
        // `;
        // skipButton.addEventListener('click', startSession);
        // videoContainer.appendChild(skipButton);
    }
}

// Expor para macro
window.MUTHUR = window.MUTHUR || {};
window.MUTHUR.toggle = toggleMuthurChat;

// Fonction de crÃ©ation de l'interface GM modifiÃ©e
function createGMMuthurInterface(userName, userId) {
    const container = document.createElement('div');
    container.id = 'gm-muthur-container';

    // Calcul de la position en fonction de la sidebar
    const sidebar = document.getElementById('sidebar');
    const rightPosition = sidebar ? `${sidebar.offsetWidth + 20}px` : '320px';

    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: ${document.getElementById('sidebar').offsetWidth + 20}px;
        width: 400px;
        height: 600px;
        background: black;
        border: 2px solid #ff9900;
        padding: 10px;
        font-family: monospace;
        z-index: 100000;
        display: flex;
        flex-direction: column;
    `;

    // CrÃ©ation de la zone de chat
    const chatLog = document.createElement('div');
    chatLog.className = 'gm-chat-log';
    chatLog.style.cssText = `
        flex: 1;
        overflow-y: auto;
        margin-bottom: 10px;
        font-family: monospace;
        padding: 5px;
        background: rgba(0, 0, 0, 0.8);
    `;
    container.appendChild(chatLog);

    // Zone de rÃ©ponse
    const responseArea = document.createElement('div');
    responseArea.style.cssText = `
        display: flex;
        gap: 5px;
        width: 100%;
        margin-top: 5px;
    `;

    // Dans la fonction createGMMuthurInterface, modifiez la partie du colorSelect
    const colorSelect = document.createElement('select');
    colorSelect.style.cssText = `
    background: black;
    border: 1px solid #ff9900;
    color: #ff9900;
    padding: 2px;
    font-family: monospace;
    height: 24px;
    width: 80px;
`;

    // Ajouter des styles personnalisÃ©s pour le select
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FF9900%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
        background-repeat: no-repeat;
        background-position: right 0.7em top 50%;
        background-size: 0.65em auto;
        padding-right: 1.4em;
    }
    select::-ms-expand {
        display: none;
    }
    select option {
        background: black;
        color: #ff9900;
    }
`;
    document.head.appendChild(styleSheet);

    const colors = {
        "#ff9900": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.orange"),
        "#00ff00": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.green"),
        "#ff0000": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.red"),
        "#ffffff": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.white"),
        "#0099ff": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.blue"),
        "#ffff00": game.i18n.localize("MUTHUR.SETTINGS.motherResponseColor.yellow")
    };

    Object.entries(colors).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        colorSelect.appendChild(option);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = `
        flex: 1;
        min-width: 200px;
        background: black;
        border: 1px solid #ff9900;
        color: #ff9900;
        padding: 5px;
        font-family: monospace;
        height: 24px;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = game.i18n.localize("MUTHUR.send");
    sendButton.style.cssText = `
        background: black;
        border: 1px solid #ff9900;
        color: #ff9900;
        padding: 5px;
        cursor: pointer;
        font-family: monospace;
        height: 24px;
        line-height: 14px;
        font-size: 12px;
        min-width: 50px;
    `;

    responseArea.appendChild(colorSelect);
    responseArea.appendChild(input);
    responseArea.appendChild(sendButton);
    container.appendChild(responseArea);

    // Gestion des rÃ©ponses
    const handleResponse = () => {
        if (input.value.trim()) {
            sendGMResponse(userId, input.value.trim(), colorSelect.value);
            input.value = '';
        }
    };

    input.addEventListener('keypress', () => {
        const soundEnabled = game.settings.get('alien-mu-th-ur', 'enableTypingSounds');
        if (soundEnabled) { playTypeSound(); }
    });

    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleResponse();
        }
    });

    sendButton.addEventListener('click', handleResponse);

    return container;
}


// Fonction pour gÃ©rer les rÃ©ponses reÃ§ues du GM
async function handleGMResponse(data) {
    if (game.user.id !== data.targetUserId) return;

    const chatLog = document.querySelector('.muthur-chat-log');
    if (!chatLog) {
        console.error("Chat log non trouvÃ©");
        return;
    }

    const response = data.command.toUpperCase();

    // Utiliser la couleur envoyÃ©e par le GM
    const motherName = game.i18n.localize("MUTHUR.motherName");
    const messageDiv = await displayMuthurMessage(chatLog, response, `${motherName}: `, data.color || '#ff9900', 'reply');
    messageDiv.classList.add('maman-message');

    chatLog.scrollTop = chatLog.scrollHeight;
}


// Fonction de rÃ©ception modifiÃ©e
async function handleMuthurResponse(data) {
    if (!game.user.isGM) return;

    let gmContainer = document.getElementById('gm-muthur-container');

    if (data.actionType === 'open' || !gmContainer) {
        gmContainer = createGMMuthurInterface(data.user, data.userId);
        document.body.appendChild(gmContainer);
    }

    const chatLog = gmContainer.querySelector('.gm-chat-log');
    if (!chatLog) {
        console.error("Chat log non trouvÃ© dans le container GM");
        return;
    }

    // Gestion spÃ©cifique pour la tentative de hack
    if (data.actionType === 'hackAsk') {
        await displayMuthurMessage(
            chatLog,
            game.i18n.format("MUTHUR.HackAskMessage", { user: data.user }),
            '',
            '#ff9900',
            'error'
        );

        const buttonsDiv = document.createElement('div');
        buttonsDiv.innerHTML = `
            <button id="hackSuccess" style="background: black; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; margin-right: 10px;">
                ${game.i18n.localize("MUTHUR.HackSuccess") || "SUCCESS"}
            </button>
            <button id="hackFailure" style="background: black; border: 1px solid #ff0000; color: #ff0000; padding: 5px 10px;">
                ${game.i18n.localize("MUTHUR.HackFailure") || "FAILURE"}
            </button>
        `;
        chatLog.appendChild(buttonsDiv);

        document.getElementById('hackSuccess').onclick = async () => {
            buttonsDiv.remove();
            await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.HackDecisionSentSuccess") || "Sent SUCCESS to player", '', '#00ff00', 'reply');
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'hackDecision',
                success: true,
                targetId: data.userId,
                fromGM: true,
                fromName: game.user.name,
                timestamp: Date.now()
            });
        };

        document.getElementById('hackFailure').onclick = async () => {
            buttonsDiv.remove();
            await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.HackDecisionSentFailure") || "Sent FAILURE to player", '', '#ff9900', 'reply');
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'hackDecision',
                success: false,
                targetId: data.userId,
                fromGM: true,
                fromName: game.user.name,
                timestamp: Date.now()
            });
        };

        return;
    }
    if (data.actionType === 'command' && game.user.isGM) {
        const input = (data.input || "").trim().toLowerCase();
        if (input === "revert hack") {
            // Envia revert para o jogador que iniciou esta sessão
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'hackDecision',
                revert: true,
                targetId: data.userId,
                fromGM: true,
                fromName: game.user.name,
                timestamp: Date.now()
            });

            await displayMuthurMessage(chatLog,
                game.i18n.localize("MUTHUR.HackRevertSent") || "Revert hack enviado ao jogador.",
                '',
                '#ffaa00',
                'reply'
            );
            return;
        }
    }
    if (data.actionType === 'hack') {
        await displayMuthurMessage(
            chatLog,
            game.i18n.format("MUTHUR.HackAttemptMessage", { user: data.user }),
            '',
            '#ff9900',
            'error'
        );

        const buttonsDiv = document.createElement('div');
        buttonsDiv.innerHTML = `
            <button id="enableHack" style="background: black; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; margin-right: 10px;">
                ${game.i18n.localize("MOTHER.EnableHack")}
            </button>
            <button id="keepDisabled" style="background: black; border: 1px solid #ff0000; color: #ff0000; padding: 5px 10px;">
                ${game.i18n.localize("MOTHER.KeepDisabled")}
            </button>
        `;
        chatLog.appendChild(buttonsDiv);

        document.getElementById('enableHack').onclick = async () => {
            await game.settings.set('alien-mu-th-ur', 'allowHack', true);
            buttonsDiv.remove();
            await displayMuthurMessage(
                chatLog,
                game.i18n.localize("MOTHER.HackEnabled"),
                '',
                '#00ff00',
                'reply'
            );
        };

        document.getElementById('keepDisabled').onclick = async () => {
            buttonsDiv.remove();
            await displayMuthurMessage(
                chatLog,
                game.i18n.localize("MOTHER.HackKeptDisabled"),
                '',
                '#ff9900',
                'reply'
            );
        };
        return;
    }

    // Gestion normale des autres messages
    await displayMuthurMessage(chatLog, `${data.user}: ${data.command}`, '', '#ff9900');

    // Gestion des actions spÃ©ciales
    if (data.actionType === 'open') {
        await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.newSessionStarted"), '', '#ff9900');
    } else if (data.actionType === 'close') {
        await displayMuthurMessage(chatLog, game.i18n.localize("MUTHUR.muthurSessionEnded"), '', '#ff9900');
        setTimeout(() => gmContainer.remove(), 2000);
    }
}

Hooks.on('chatMessage', (chatLog, message, chatData) => {
    const command = message.toLowerCase().trim();
    
    // Comando principal /muthur
    if (command === '/muthur') {
        chatData.content = '';
        toggleMuthurChat();
        ui.notifications.info(game.i18n.localize("MUTHUR.chatCommand.activated"));
        return false;
    }
    
    // Comando alternativo /mother (opcional)
    if (command === '/mother') {
        chatData.content = '';
        toggleMuthurChat();
        ui.notifications.info(game.i18n.localize("MUTHUR.chatCommand.activated"));
        return false;
    }
    
    // Comando de ajuda /muthur help
    if (command === '/muthur help' || command === '/muthur ajuda') {
        chatData.content = '';
        
        ChatMessage.create({
            content: `
                <div style="border: 1px solid #00ff00; padding: 10px; background: rgba(0,0,0,0.8); color: #00ff00; font-family: monospace;">
                    <h3>MU/TH/UR 6000 - Comandos Disponíveis</h3>
                    <p><strong>/muthur</strong> - Ativa o terminal MU/TH/UR</p>
                    <p><strong>/mother</strong> - Ativa o terminal MU/TH/UR (comando alternativo)</p>
                    <p><strong>/muthur help</strong> - Mostra esta ajuda</p>
                </div>
            `,
            whisper: [game.user.id]
        });
        
        return false;
    }
    
    return true;
});

// Modifier la partie des hooks et de la communication socket
Hooks.once('ready', async () => {

    /**
     * GM command to revert a player's hack attempt so they can retry.
     * Usage (GM chat): /muthur revert <playerNameOrId>
     */
    Hooks.on('chatMessage', (chatLog, messageText, chatData) => {
        try {
            if (!messageText) return;
            const cmd = messageText.trim();
            if (!cmd.toLowerCase().startsWith('/muthur revert')) return;
            if (!game.user.isGM) {
                ui.notifications.warn("Only GM can use /muthur revert");
                return false;
            }
            // parse argument
            const parts = cmd.split(/\s+/);
            if (parts.length < 3) {
                ui.notifications.warn("Usage: /muthur revert <playerNameOrId>");
                return false;
            }
            const targetArg = parts.slice(2).join(' ');
            // try to resolve by user id
            let user = game.users.get(targetArg);
            if (!user) {
                // try by exact username
                user = game.users.find(u => u.name === targetArg);
            }
            if (!user) {
                // try by partial match
                user = game.users.find(u => u.name.toLowerCase().includes(targetArg.toLowerCase()));
            }
            if (!user) {
                ui.notifications.warn("Could not find user: " + targetArg);
                return false;
            }
            // emit socket to target user
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'hackDecision',
                revert: true,
                targetId: user.id,
                fromGM: true,
                fromName: game.user.name,
                timestamp: Date.now()
            });
            // feedback to GM
            ui.notifications.info(`Sent revert to ${user.name}`);
            // prevent message from posting to chat
            return false;
        } catch (err) {
            console.error('muthur revert command error', err);
            return false;
        }
    });

    // Chargement des traductions
    /*
    if (game.user.isGM) {
        ChatMessage.create({
            content: `
                <div style="text-align: center; padding: 10px;">
                    <img src="modules/alien-mu-th-ur/pub/Shazprod.jpg" style="height: 100px; margin-bottom: 10px;">
                    <p style="font-weight: bold; text-decoration: underline;">${game.i18n.localize("MUTHUR.DONATION.support")}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                        <a href="https://ko-fi.com/shazprod" target="_blank">
                            <img src="modules/alien-mu-th-ur/pub/kofi.webp" style="height: 36px;">
                        </a>
                        <a href="https://fr.tipeee.com/shaz-prod" target="_blank">
                            <img src="modules/alien-mu-th-ur/pub/tipeee.png" style="height: 36px;">
                        </a>
                    </div>
                </div>
            `,
            whisper: [game.user.id]
        });
    }
    */

    try {
        const module = game.modules.get('alien-mu-th-ur');
        if (!module) {
            console.error("Module MU/TH/UR non trouvé!");
            return;
        }

        const languagePath = `modules/alien-mu-th-ur/lang/${game.i18n.lang}.json`;
        const response = await fetch(languagePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();

        // Fusion des traductions
        game.i18n.translations = foundry.utils.mergeObject(
            game.i18n.translations,
            translations
        );

    } catch (error) {
        console.error("Erreur lors du chargement des traductions:", error);
        return;
    }

    // Registrar o comando de chat /muthur
    game.chatCommands = game.chatCommands || {};
    game.chatCommands.muthur = {
        name: "/muthur",
        description: game.i18n.localize("MUTHUR.chatCommand.description"),
        callback: () => {
            toggleMuthurChat();
        }
    };

    console.log("Comando de chat /muthur registrado");

    // Initialiser l'état de la session
    currentMuthurSession = {
        active: false,
        userId: null,
        userName: null
    };

    // Un seul listener pour tous les messages socket
    game.socket.on('module.alien-mu-th-ur', (data) => {
        if (data.type === 'muthurCommand' && game.user.isGM) {
            handleMuthurResponse(data);
        } else if (data.type === 'muthurResponse' && !game.user.isGM) {
            handleGMResponse(data);
        } else if (data.type === 'hackProgress' && game.user.isGM) {
            const gmChatLog = document.querySelector('.gm-chat-log');
            if (gmChatLog) {
                if (!currentGMProgress) {
                    currentGMProgress = displayGMHackProgress(gmChatLog);
                }
                // Mettre à jour la progression
                if (currentGMProgress && currentGMProgress.updateProgress) {
                    currentGMProgress.updateProgress(data.progress);
                }
            }
        } else if (data.type === 'hackComplete' && game.user.isGM) {
            // Nettoyer la barre de progression dans tous les cas
            if (currentGMProgress) {
                currentGMProgress.cleanup();
                currentGMProgress = null;
            }

            // Si le hack a échoué, fermer la fenêtre après 5 secondes
            if (!data.success) {
                setTimeout(() => {
                    const gmContainer = document.getElementById('gm-muthur-container');
                    if (gmContainer) gmContainer.remove();
                }, 5000);
            }
        
        } else if (data.type === 'hackDecision') {
            // Decision sent by the GM: if it's for this player, continue the hacking attempt with the chosen result
            if (data.targetId === game.user.id) {
                const chatLog = document.querySelector('.muthur-chat-log');
                if (chatLog) {
                    if (data.revert) {
                        // GM requested a revert of the hack attempt
                        try {
                            if (typeof handleHackRevert === 'function') {
                                handleHackRevert(chatLog, data);
                            } else {
                                // Fallback: call simulateHackingAttempt with special 'revert' flag
                                simulateHackingAttempt(chatLog, 'revert');
                            }
                        } catch (err) {
                            console.error('Error handling hack revert:', err);
                        }
                    } else {
                        // Continue the hacking attempt with the forced boolean result from the GM
                        simulateHackingAttempt(chatLog, !!data.success);
                    }
                }
            }
        } else if (data.type === 'sessionStatus') {
            // Mettre à jour l'état de la session pour tous les clients
            currentMuthurSession.active = data.active;
            if (data.active) {
                currentMuthurSession.userId = data.userId;
                currentMuthurSession.userName = data.userName;
                // Notification pour les autres utilisateurs
                if (game.user.id !== data.userId) {
                    ui.notifications.info(game.i18n.format("MUTHUR.sessionStartedBy", { userName: data.userName }));
                }
            } else {
                // Notification de fin de session
                if (game.user.id !== currentMuthurSession.userId) {
                    ui.notifications.info(game.i18n.format("MUTHUR.sessionEndedBy", { userName: currentMuthurSession.userName }));
                }
                currentMuthurSession.userId = null;
                currentMuthurSession.userName = null;
            }

        } else if (data.type === 'showCerberusGlobal') {
            // Ne pas créer de nouvelles fenêtres pour l'initiateur
            if (data.fromId !== game.user.id) {
                createCerberusWindow();
                startCerberusCountdown();
            }

        } else if (data.type === 'stopCerberus') {
            if (cerberusCountdownInterval) {
                clearInterval(cerberusCountdownInterval);
            }
            setTimeout(() => {
                const allCerberusElements = document.querySelectorAll('[id*="cerberus"], [class*="cerberus"]');
                allCerberusElements.forEach(element => {
                    element.remove();
                });
            }, 5000);

        } else if (data.type === 'closeMuthurChats') {
            const allMuthurChats = document.querySelectorAll('#muthur-chat-container, #gm-muthur-container');
            allMuthurChats.forEach(chat => {
                chat.style.animation = 'fadeOut 1s ease-out';
                setTimeout(() => chat.remove(), 1000);
            });

            currentMuthurSession = {
                active: false,
                userId: null,
                userName: null
            };

        } else if (data.type === 'hackDisabled' && game.user.isGM) {
            const gmChatLog = document.querySelector('.gm-chat-log');
            if (gmChatLog) {
                displayMuthurMessage(
                    gmChatLog,
                    game.i18n.localize("MOTHER.HackDisabledInfo"),
                    '',
                    '#ff9900',
                    'error'
                ).then(() => {
                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.innerHTML = `
                        <button id="enableHack" style="background: black; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; margin-right: 10px;">
                            ${game.i18n.localize("MOTHER.EnableHack")}
                        </button>
                        <button id="keepDisabled" style="background: black; border: 1px solid #ff0000; color: #ff0000; padding: 5px 10px;">
                            ${game.i18n.localize("MOTHER.KeepDisabled")}
                        </button>
                    `;
                    gmChatLog.appendChild(buttonsDiv);

                    document.getElementById('enableHack').onclick = async () => {
                        await game.settings.set('alien-mu-th-ur', 'allowHack', true);
                        buttonsDiv.remove();
                        await displayMuthurMessage(
                            gmChatLog,
                            game.i18n.localize("MOTHER.HackEnabled"),
                            '',
                            '#00ff00',
                            'reply'
                        );
                    };

                    document.getElementById('keepDisabled').onclick = async () => {
                        buttonsDiv.remove();
                        await displayMuthurMessage(
                            gmChatLog,
                            game.i18n.localize("MOTHER.HackKeptDisabled"),
                            '',
                            '#ff9900',
                            'reply'
                        );
                    };
                });
            }
        }
    });

    // ADICIONADO: Chamar o fallback se necessário após 3 segundos
    /*
    setTimeout(() => {
        // Verificar se o botão foi adicionado aos controles
        const controls = document.querySelector('[data-tool="muthur"]');
        if (!controls) {
            console.warn("Botão MU/TH/UR não encontrado nos controles, criando fallback");
            createFallbackButton();
        }
    }, 3000);
*/
    // Log de démarrage
    console.log(game.i18n.localize("MUTHUR.systemReady"));
});

Hooks.on('disconnect', () => {
    const chatContainer = document.getElementById('muthur-chat-container');
    if (chatContainer) {
        chatContainer.remove();
    }

    const gmContainer = document.getElementById('gm-muthur-container');
    if (gmContainer) {
        gmContainer.remove();
    }

    // RÃ©initialiser l'Ã©tat de la session
    currentMuthurSession.active = false;
    currentMuthurSession.userId = null;
    currentMuthurSession.userName = null;
});

Hooks.on('canvasReady', () => {
    const chatContainer = document.getElementById('muthur-chat-container');
    if (chatContainer) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            chatContainer.style.right = `${sidebar.offsetWidth + 20}px`;
        }
    }
});

// Nouvelle fonction pour envoyer la rÃ©ponse du GM au joueur
function sendGMResponse(targetUserId, message, color = '#ff9900') {
    if (!game.socket) {
        console.error("Socket non disponible!");
        return;
    }

    try {
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'muthurResponse',
            command: message,
            fromGM: true,
            targetUserId: targetUserId,
            color: color,
            timestamp: Date.now()
        });

        // Ajout du message dans le chat GM
        const gmChatLog = document.querySelector('.gm-chat-log');
        if (gmChatLog) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${game.i18n.localize("MUTHUR.motherName")}: ${message}`;
            messageDiv.style.color = color;
            gmChatLog.appendChild(messageDiv);
            gmChatLog.scrollTop = gmChatLog.scrollHeight;
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de la rÃ©ponse:", error);
        ui.notifications.error("Erreur de communication avec le joueur");
    }
}


function getTranslation(key) {
    const translation = game.i18n.localize(key);
    if (translation === key) {
        console.warn(`Traduction manquante pour la clÃ©: ${key}`);
        return key.split('.')[1]; // Retourne la partie aprÃ¨s le point
    }
    return translation;
}



function playTypeSound() {
    try {
        // RÃ©cupÃ©rer le volume depuis les settings
        const volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');

        // GÃ©nÃ©rer un nombre alÃ©atoire entre 1 et 34
        const randomNumber = Math.floor(Math.random() * 34) + 1;

        // Construire le chemin du fichier en utilisant le bon chemin du module
        const soundPath = `modules/alien-mu-th-ur/sounds/keypress/Keypress_${randomNumber}.wav`;



        const sound = new Audio(soundPath);
        sound.volume = volume;

        // Ajouter un gestionnaire d'erreur plus dÃ©taillÃ©
        sound.onerror = (e) => {
            console.error("Erreur de chargement du son:", e);
        };

        return sound.play();

    } catch (error) {
        console.error("Erreur lors de la lecture du son:", error);
    }
}

function isTypewriterEnabled() {
    try {
        return game.settings.get('alien-mu-th-ur', 'enableTypewriter');
    } catch (error) {
        console.warn("Erreur lors de la lecture des paramÃ¨tres typewriter:", error);
        return true; // Valeur par dÃ©faut en cas d'erreur
    }
}

// Nouvelle fonction pour jouer le son de retour
function playReturnSound() {
    try {
        // RÃ©cupÃ©rer le volume depuis les settings
        const volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');

        // GÃ©nÃ©rer un nombre alÃ©atoire entre 1 et 19
        const randomNumber = Math.floor(Math.random() * 19) + 1;

        // Construire le chemin du fichier
        const soundPath = `modules/alien-mu-th-ur/sounds/Key press return/Return_beep_${randomNumber}.wav`;



        const sound = new Audio(soundPath);
        sound.volume = volume;

        sound.onerror = (e) => {
            console.error("Erreur de chargement du son de retour:", e);
        };

        return sound.play();

    } catch (error) {
        console.error("Erreur lors de la lecture du son de retour:", error);
    }
}

// Nouvelle fonction pour jouer le son d'erreur
function playErrorSound() {
    try {
        // RÃ©cupÃ©rer le volume depuis les settings
        const volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');

        // Chemin du fichier d'erreur
        const soundPath = `modules/alien-mu-th-ur/sounds/pec_message/error.wav`;



        const sound = new Audio(soundPath);
        sound.volume = volume;

        sound.onerror = (e) => {
            console.error("Erreur de chargement du son d'erreur:", e);
        };

        return sound.play();

    } catch (error) {
        console.error("Erreur lors de la lecture du son d'erreur:", error);
    }
}

function playComSound() {
    try {
        // RÃ©cupÃ©rer le volume depuis les settings
        const volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');

        // GÃ©nÃ©rer un nombre alÃ©atoire entre 1 et 3
        const randomNumber = Math.floor(Math.random() * 3) + 1;

        // Construire le chemin du fichier
        const soundPath = `modules/alien-mu-th-ur/sounds/pec_message/Save_Sound_Communications_${randomNumber}.wav`;



        const sound = new Audio(soundPath);
        sound.volume = volume;

        sound.onerror = (e) => {
            console.error("Erreur de chargement du son de communication:", e);
        };

        return sound.play();

    } catch (error) {
        console.error("Erreur lors de la lecture du son de communication:", error);
    }
}

// Nouvelle fonction pour jouer le son de rÃ©ponse
// Modifier la fonction playReplySound pour gÃ©rer la lecture en chaÃ®ne
async function playReplySound() {
    try {
        if (currentReplySound) {
            currentReplySound.pause();
            currentReplySound.currentTime = 0;
        }

        const volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
        const randomNumber = Math.floor(Math.random() * 9) + 1;
        const soundPath = `modules/alien-mu-th-ur/sounds/reply/Computer_Reply_${randomNumber}.wav`;



        currentReplySound = new Audio(soundPath);
        currentReplySound.volume = volume;

        currentReplySound.onerror = (e) => {
            console.error("Erreur de chargement du son de rÃ©ponse:", e);
            currentReplySound = null;
        };

        // Ajouter un gestionnaire pour la fin du son
        currentReplySound.onended = async () => {
            if (shouldContinueReplySound) {
                await playReplySound(); // Jouer un nouveau son si on doit continuer
            }
        };

        return currentReplySound.play();

    } catch (error) {
        console.error("Erreur lors de la lecture du son de rÃ©ponse:", error);
        currentReplySound = null;
    }
}

function stopReplySound() {
    shouldContinueReplySound = false;
    if (currentReplySound) {
        currentReplySound.pause();
        currentReplySound.currentTime = 0;
        currentReplySound = null;
    }
}


// Fonction normale pour le hack avec typewriter standard
async function displayHackMessage(chatLog, message, color, type, isPassword = false) {
    const messageDiv = document.createElement('div');
    messageDiv.style.color = color;
    messageDiv.classList.add('message', type);
    chatLog.appendChild(messageDiv);

    if (isPassword) {
        // Affichage instantanÃ© pour les mots de passe
        messageDiv.textContent = message;
        if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
            playComSound(); // Son de communication pour les mots de passe
        }
        return Promise.resolve();
    } else {
        // Effet typewriter normal pour le reste avec son mais sans bruit de touches
        let displayedText = '';
        for (const char of message) {
            displayedText += char;
            messageDiv.textContent = displayedText;
            if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds') && char === ' ') {
                playComSound(); // Son de communication pÃ©riodique
            }
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        return Promise.resolve();
    }
}


/**
 * handleHackRevert(chatLog, data)
 * Called when the GM requests a revert of the player's hack.
 * This default implementation will display a small message to the chat log
 * and attempt to call an optional rollback function if the module exposes it.
 * You can customize this to perform actual state rollback if your module has that API.
 */
function handleHackRevert(chatLog, data) {
    try {
        // Try to call a module-level rollback if present
        if (typeof MUTHUR !== 'undefined' && typeof MUTHUR.rollbackHack === 'function') {
            MUTHUR.rollbackHack(data.targetId, data);
            displayMuthurMessage(chatLog, game.i18n.localize('MUTHUR.HackReverted') || 'Hack reverted by GM', '', '#ffaa00', 'warning');
            return;
        }
        // Default behavior: notify the player their hack was reverted
        displayMuthurMessage(chatLog, game.i18n.localize('MUTHUR.HackReverted') || 'Hack reverted by GM', '', '#ffaa00', 'warning');
    } catch (err) {
        console.error('handleHackRevert error:', err);
    }
}
async function simulateHackingAttempt(chatLog, forcedSuccess = null) {

    if (hackSuccessful) {
        await displayMuthurMessage(
            chatLog,
            game.i18n.localize("MOTHER.HackAlreadySuccessful"),
            '',
            '#ff0000',
            'error'
        );
        return;
    }

    const container = document.getElementById('muthur-chat-container');
    container.classList.add('hacking-active');

    // Sauvegarder l'Ã©tat des sons de frappe
    const typingSoundEnabled = game.settings.get('alien-mu-th-ur', 'enableTypingSounds');
    const originalTypeSound = playTypeSound;
    // DÃ©sactiver temporairement les sons de frappe
    playTypeSound = () => { }; // Fonction vide pour dÃ©sactiver le son des touches

    // Lancer un dÃ© 6
    // const roll = await new Roll('1d6').evaluate({ async: true });
    // const isSuccess = roll.total % 2 === 0; // Pair = succÃ¨s

    let isSuccess;
    let roll;
    const hackResult = game.settings.get('alien-mu-th-ur', 'hackResult');

    switch (hackResult) {
        case "success":
            isSuccess = true;
            break;
        case "failure":
            isSuccess = false;
            break;
        case "ask":
            // If a forced decision was provided (from GM), use it
            if (forcedSuccess !== null) {
                isSuccess = !!forcedSuccess;
                break;
            }
            // If this is the player client, send a request to the GM and wait
            if (!game.user.isGM) {
                // Restore original typing sound (we disabled it earlier)
                playTypeSound = originalTypeSound;
                // Send request to GM so they can choose success/failure (no player-facing waiting message)
                sendToGM(game.i18n.format("MUTHUR.HackAskMessage", { user: game.user.name }), 'hackAsk');
                return;
            }
            // If GM initiated the hack, fallthrough to random behavior
        default: // "random" or GM fallback
            roll = await new Roll('1d6').evaluate({ async: true });
            isSuccess = roll.total % 2 === 0; // Pair = succÃ¨s

            // Afficher le rÃ©sultat du dÃ© visuellement seulement en mode alÃ©atoire
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ alias: "MU/TH/UR 6000" }),
                flavor: game.i18n.localize('MOTHER.HackAttempt'),
                whisper: [game.user.id]
            });
            break;
    }





    // Fonction pour gÃ©nÃ©rer un mot de passe alÃ©atoire
    const generatePassword = () => {
        // Liste de mots de passe thÃ©matiques
        const thematicPasswords = [
            'FACEHUGGER',
            'XENOMORPH',
            'RIPLEY',
            'NOSTROMO',
            'WEYLAND',
            'SULACO',
            'LV426',
            'CHESTBURSTER',
            'HADLEYHOPE',
            'BISHOP',
            'ASH',
            'BURKE',
            'NARCISSUS',
            'SEVASTOPOL',
            'TORRENS',
            'ANESIDORA',
            'WARRANT0FFICER',
            'JONESY',
            'PROMETHEUS',
            'DERELICT',
            'SPACEJOCKEY',
            'UNITYPREFAB',
            'GATEWAY',
            'COLONIAL',
            'MARINES',
            'POWERLOADER',
            'SMARTGUN',
            'M41APULSE',
            'USCM',
            'BUILDBET7ER'
        ];

        // 20% de chance d'utiliser un mot de passe thÃ©matique
        if (Math.random() < 0.2) {
            return thematicPasswords[Math.floor(Math.random() * thematicPasswords.length)];
        }

        // Sinon, gÃ©nÃ©rer un mot de passe alÃ©atoire classique
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        return Array(12).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const style = document.createElement('style');
    style.textContent = `
        @keyframes subtleGlitch {
            0% { transform: translate(0) }
            20% { transform: translate(-0.5px, 0.5px) }
            40% { transform: translate(-0.5px, -0.5px) }
            60% { transform: translate(0.5px, 0.5px) }
            80% { transform: translate(0.5px, -0.5px) }
            100% { transform: translate(0) }
        }
        .hacking-active {
            animation: subtleGlitch 0.8s infinite;
            position: relative;
            overflow: hidden;
        }
        .matrix-code {
            position: absolute;
            top: 0;
            right: 0;
            color: #0f0;
            font-size: 10px;
            opacity: 0.2;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'matrix-code';
    container.appendChild(matrixContainer);

    const updateMatrix = () => {
        matrixContainer.textContent = Array(20).fill(0)
            .map(() => Math.random().toString(36).substring(2, 4))
            .join(' ');
    };
    const matrixInterval = setInterval(updateMatrix, 50);

    const glitchEffect = async () => {
        const overlay = document.getElementById('muthur-glitch-overlay') || createFullScreenGlitch();
        if (container) {
            const intensity = Math.random() * 4 - 2;

            // Effet sur le conteneur de chat
            container.style.transform = `translate(${intensity}px, ${intensity}px) skew(${intensity}deg)`;
            container.style.filter = `hue-rotate(${Math.random() * 360}deg) blur(${Math.random() * 2}px)`;

            // Effet sur tout l'Ã©cran
            overlay.style.opacity = '0.5';
            overlay.style.backgroundColor = Math.random() > 0.5 ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)';
            overlay.style.transform = `scale(${1 + Math.random() * 0.02}) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            overlay.style.filter = `
                url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="filter"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter></svg>#filter')
                blur(${Math.random() * 1}px)
                hue-rotate(${Math.random() * 360}deg)
            `;

            await new Promise(resolve => setTimeout(resolve, 100));

            // RÃ©initialisation
            container.style.transform = 'none';
            container.style.filter = 'none';
            overlay.style.opacity = '0';
            overlay.style.transform = 'none';
            overlay.style.filter = 'none';
        }
    };

    // GÃ©nÃ©rer 50 tentatives de mot de passe
    const passwordAttempts = Array(50).fill(0).map(() => ({
        text: `ATTEMPT: ${generatePassword()}`,
        color: '#00ff00',
        type: 'reply'
    }));

    const stopHackingWindows = createHackingWindows();
    try {
        // Simulation initiale
        for (let i = 0; i < window.hackingSequences.length; i++) {
            await displayHackMessage(chatLog, window.hackingSequences[i], '#00ff00', 'reply', false);
            chatLog.scrollTop = chatLog.scrollHeight;

            if (!game.user.isGM) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'hackProgress',
                    progress: Math.floor((i + 1) * 30 / window.hackingSequences.length),
                    fromId: game.user.id
                });
            }
        }



        // DÃ©filement rapide des mots de passe
        for (let i = 0; i < passwordAttempts.length; i++) {
            const attempt = passwordAttempts[i];
            await displayHackMessage(chatLog, attempt.text, attempt.color, attempt.type, true);
            chatLog.scrollTop = chatLog.scrollHeight;

            if (Math.random() < (i / passwordAttempts.length) * 0.5) {
                await glitchEffect();
            }
            await new Promise(resolve => setTimeout(resolve, 50));

            if (!game.user.isGM) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'hackProgress',
                    progress: Math.floor(30 + (i + 1) * 40 / passwordAttempts.length),
                    fromId: game.user.id
                });
            }
        }

        // Suite des sÃ©quences
        for (let i = 0; i < window.postPasswordSequences.length; i++) {
            await displayHackMessage(chatLog, window.postPasswordSequences[i], '#00ff00', 'reply', false);

            if (Math.random() < 0.6) {
                await glitchEffect();
            }

            chatLog.scrollTop = chatLog.scrollHeight;

            if (!game.user.isGM) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'hackProgress',
                    progress: Math.floor(70 + (i + 1) * 15 / window.postPasswordSequences.length),
                    fromId: game.user.id
                });
            }
        }


        // SÃ©quences d'alerte
        const alertSequences = isSuccess ? window.successSequences : window.failureSequences;
        for (let i = 0; i < alertSequences.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            await displayHackMessage(
                chatLog,
                game.i18n.localize(alertSequences[i].text),
                alertSequences[i].color,
                alertSequences[i].type,
                false
            );
            chatLog.scrollTop = chatLog.scrollHeight;

            if (!game.user.isGM) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'hackProgress',
                    progress: Math.floor(85 + (i + 1) * 15 / alertSequences.length),
                    fromId: game.user.id
                });
            }

            if (Math.random() > 0.7) {
                await glitchEffect();
                if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
                    playErrorSound();
                }
            }
        }
        // Nouveau code pour le succÃ¨s du hack
        if (isSuccess) {
            hackSuccessful = true;

            // Effet de glitch final intense
            const overlay = document.getElementById('muthur-glitch-overlay') || createFullScreenGlitch();

            for (let i = 0; i < 10; i++) {
                overlay.style.opacity = '0.8';
                overlay.style.backgroundColor = 'rgba(255,0,0,0.2)';
                await glitchEffect();
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Effet de transition rouge
            container.style.transition = 'background-color 2s';
            container.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

            // Effet de glitch final
            for (let i = 0; i < 5; i++) {
                await glitchEffect();
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (!game.user.isGM) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'hackComplete',
                    success: isSuccess,
                    fromId: game.user.id,
                    fromName: game.user.name
                });
            }
            stopHackingWindows();

            // if (cleanupHackingWindows) {
            //     cleanupHackingWindows();
            // }
            // Attendre 2 secondes
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Effacer l'Ã©cran
            chatLog.innerHTML = '';






            // Garder l'effet rouge pour le message de bienvenue
            chatLog.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';

            // Afficher le message de bienvenue
            await displayHackMessage(
                chatLog,
                game.i18n.localize('MOTHER.WelcomeAdminFull'),
                '#00ff00',
                'normal',
                false
            );
        }

    } finally {
        // Restaurer la fonction de son de frappe originale
        playTypeSound = originalTypeSound;
        const overlay = document.getElementById('muthur-glitch-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Nettoyage
    clearInterval(matrixInterval);
    matrixContainer.remove();
    container.classList.remove('hacking-active');
    style.remove();



    //     // Envoyer le rÃ©sultat final et arrÃªter la barre de progression
    if (!game.user.isGM) {
        // Envoyer le rÃ©sultat final et arrÃªter la barre de progression
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'hackComplete',
            success: isSuccess,
            fromId: game.user.id,
            fromName: game.user.name
        });

        // Envoyer le message de dÃ©tection
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'muthurCommand',
            command: game.i18n.format("MUTHUR.HackDetectionMessage", {
                userName: game.user.name,
                result: isSuccess ? game.i18n.localize("MUTHUR.HackSuccess") : game.i18n.localize("MUTHUR.HackFailure")
            }),
            user: game.user.name,
            userId: game.user.id,
            timestamp: Date.now()
        });
    }


    if (!isSuccess) {
        const lockTime = Date.now();
        localStorage.setItem('muthur-terminal-lock', lockTime.toString());

        // Envoyer un message au GM pour fermer sa fenÃªtre
        if (!game.user.isGM) {
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'hackComplete',
                success: isSuccess,
                fromId: game.user.id,
                fromName: game.user.name,
                timestamp: Date.now()
            });

            // Envoyer le message de dÃ©tection avec le nom du joueur
            //     game.socket.emit('module.alien-mu-th-ur', {
            //         type: 'muthurCommand',
            //         command: `!!! TENTATIVE DE HACKING DÃ‰TECTÃ‰E PAR ${game.user.name} !!! - Ã‰CHEC`,
            //         fromId: game.user.id,
            //         fromName: game.user.name,
            //         timestamp: Date.now()
            //     });
            // }

            setTimeout(() => {
                // Fermer la fenÃªtre du joueur
                const container = document.getElementById('muthur-chat-container');
                if (container) container.remove();
            }, 5000);
        }
    }

    // Nettoyage final
    if (!isSuccess) {
        // Nettoyer les fenÃªtres de hacking
        if (typeof stopHackingWindows === 'function') {
            stopHackingWindows();
        }
        
        // Nettoyer les autres Ã©lÃ©ments
        clearHackingElements();
        
        // Fermer la session aprÃ¨s un dÃ©lai
        setTimeout(() => {
            const muthurChat = document.getElementById('muthur-chat-container');
            if (muthurChat) {
                muthurChat.remove();
            }
            currentMuthurSession.active = false;
            currentMuthurSession.userId = null;
            currentMuthurSession.userName = null;
        }, 5000);
    }

    // Informer le GM du rÃ©sultat
    if (!game.user.isGM) {
        game.socket.emit('module.alien-mu-th-ur', {
            type: 'hackComplete',
            success: isSuccess,
            fromId: game.user.id
        });
    }
}

// Ajouter cette nouvelle fonction pour nettoyer les Ã©lÃ©ments de hacking
function clearHackingElements() {
    // Nettoyer les fenÃªtres de hacking
    const hackingWindows = document.querySelectorAll('.hacking-window');
    hackingWindows.forEach(window => window.remove());
    
    // Nettoyer les styles de hacking
    const hackingStyles = document.querySelectorAll('style[data-hacking]');
    hackingStyles.forEach(style => style.remove());
    
    // Nettoyer les overlays
    const overlays = document.querySelectorAll('.matrix-code, #muthur-glitch-overlay');
    overlays.forEach(overlay => overlay.remove());
}

async function handleSpecialOrder(chatLog, command) {
    const orders = {
        "754": "MOTHER.SpecialOrders.754",
        "899": "MOTHER.SpecialOrders.899",
        "931": "MOTHER.SpecialOrders.931",
        "937": "MOTHER.SpecialOrders.937",
        "939": "MOTHER.SpecialOrders.939",
        "966": "MOTHER.SpecialOrders.966",
        "CERBERUS": "MOTHER.SpecialOrders.Cerberus"
    };

    // Extraire l'ordre de la commande
    let orderKey = command.toUpperCase()
        .replace(/^ORDRE\s+SPECIAL\s+/i, '')
        .replace(/^ORDRE\s+SPÃ‰CIAL\s+/i, '')  // Ajout de l'accent
        .replace(/^ORDER\s+SPECIAL\s+/i, '')   // Ajout de ORDER
        .replace(/^SPECIAL\s+ORDRE\s+/i, '')
        .replace(/^SPÃ‰CIAL\s+ORDRE\s+/i, '')   // Ajout de l'accent
        .replace(/^SPECIAL\s+ORDER\s+/i, '')    // Ajout de ORDER
        .replace(/^ORDRE\s+/i, '')
        .replace(/^ORDER\s+/i, '')              // Ajout de ORDER
        .replace(/^SPECIAL\s+/i, '')
        .replace(/^SPÃ‰CIAL\s+/i, '')           // Ajout de l'accent
        .replace(/^PROTOCOLE\s+/i, '')
        .replace(/^PROTOCOL\s+/i, '')          // Ajout de PROTOCOL
        .trim();

    if (orders[orderKey]) {
        if (orderKey === 'CERBERUS') {
            if (!game.settings.get('alien-mu-th-ur', 'allowCerberus')) {
                await displayMuthurMessage(chatLog, game.i18n.localize('MOTHER.CerberusDisabled'), '', '#ff0000', 'error');
                return;
            }

            if (!game.user.isGM && hackSuccessful) {
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'muthurCommand',
                    command: game.i18n.format("MOTHER.CerberusHackAlert", { userName: game.user.name }),
                    user: 'MUTHUR 6000',
                    userId: game.user.id,
                    timestamp: Date.now()
                });
            }
            // Afficher le message de confirmation
            await displayMuthurMessage(
                chatLog,
                game.i18n.localize("MOTHER.SpecialOrders.Cerberus.confirmation"),
                '',
                '#ff0000',
                'error'
            );


            const confirmationDiv = document.createElement('div');
            confirmationDiv.style.cssText = `
                border: 2px solid #ff3333;
                background: rgba(0, 0, 0, 0.9);
                padding: 20px;
                margin: 15px 0;
                text-align: center;
                animation: borderPulse 1s infinite;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                width: fit-content;
                margin-left: auto;
                margin-right: auto;
            `;

            // Ajouter le style d'animation pour la bordure
            const style = document.createElement('style');
            style.textContent = `
                @keyframes borderPulse {
                    0% { border-color: #ff3333; }
                    50% { border-color: #990000; }
                    100% { border-color: #ff3333; }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            const confirmButton = document.createElement('button');
            confirmButton.textContent = game.i18n.localize("MOTHER.SpecialOrders.Cerberus.confirm");
            confirmButton.style.cssText = `
                background: #330000;
                color: #ff3333;
                border: 1px solid #ff3333;
                padding: 8px 15px;
                margin: 0;
                font-family: monospace;
                font-size: 14px;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.3s ease;
                text-shadow: 0 0 5px #ff3333;
                min-width: 100px;
                height: 32px;
                line-height: 1;
            `;

            const cancelButton = document.createElement('button');
            cancelButton.textContent = game.i18n.localize("MOTHER.SpecialOrders.Cerberus.cancel");
            cancelButton.style.cssText = `
                background: #001100;
                color: #33ff33;
                border: 1px solid #33ff33;
                padding: 8px 15px;
                margin: 0;
                font-family: monospace;
                font-size: 14px;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.3s ease;
                text-shadow: 0 0 5px #33ff33;
                min-width: 100px;
                height: 32px;
                line-height: 1;
            `;

            // Ajouter les effets hover
            confirmButton.onmouseover = () => {
                confirmButton.style.background = '#660000';
                confirmButton.style.boxShadow = '0 0 10px #ff3333';
            };
            confirmButton.onmouseout = () => {
                confirmButton.style.background = '#330000';
                confirmButton.style.boxShadow = 'none';
            };

            cancelButton.onmouseover = () => {
                cancelButton.style.background = '#003300';
                cancelButton.style.boxShadow = '0 0 10px #33ff33';
            };
            cancelButton.onmouseout = () => {
                cancelButton.style.background = '#001100';
                cancelButton.style.boxShadow = 'none';
            };

            confirmationDiv.appendChild(confirmButton);
            confirmationDiv.appendChild(cancelButton);
            chatLog.appendChild(confirmationDiv);

            // Attendre la confirmation
            // Dans handleSpecialOrder, modifier la partie de confirmation

            const confirmation = await new Promise(resolve => {
                confirmButton.onclick = async () => {
                    confirmationDiv.remove();
                    // Message local
                    await displayMuthurMessage(
                        chatLog,
                        game.i18n.localize("MOTHER.CerberusConfirmed"),
                        '',
                        '#ff0000',
                        'error'
                    );
                    // Message au GM
                    if (!game.user.isGM && hackSuccessful) {
                        game.socket.emit('module.alien-mu-th-ur', {
                            type: 'muthurCommand',
                            command: game.i18n.localize("MOTHER.CerberusConfirmed"),
                            user: 'MUTHUR 6000',
                            userId: game.user.id,
                            timestamp: Date.now()
                        });
                    }
                    resolve(true);
                };
                cancelButton.onclick = async () => {
                    confirmationDiv.remove();
                    // Message local
                    await displayMuthurMessage(
                        chatLog,
                        game.i18n.localize("MOTHER.CerberusCancelled"),
                        '',
                        '#00ff00',
                        'reply'
                    );
                    // Message au GM
                    if (!game.user.isGM && hackSuccessful) {
                        game.socket.emit('module.alien-mu-th-ur', {
                            type: 'muthurCommand',
                            command: game.i18n.localize("MOTHER.CerberusCancelled"),
                            user: 'MUTHUR 6000',
                            userId: game.user.id,
                            timestamp: Date.now()
                        });
                    }
                    resolve(false);
                };
            });

            if (!confirmation) {
                return;
            }

            if (!confirmation) {
                await displayMuthurMessage(
                    chatLog,
                    game.i18n.localize("MOTHER.SpecialOrders.Cerberus.cancelled"),
                    '',
                    '#00ff00',
                    'reply'
                );
                return;
            }



            // Modifier cette partie pour Ã©viter le double affichage
            await displayHackMessage(
                chatLog,
                game.i18n.localize("MOTHER.SpecialOrders.Cerberus.warning"),
                '#ff0000',
                'error',
                false
            );

            await new Promise(resolve => setTimeout(resolve, 1000));


            createCerberusWindow();
            startCerberusCountdown();

            // Envoyer le signal Ã  tous les autres clients
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'showCerberusGlobal',
                fromId: game.user.id,
                fromName: game.user.name,
                startTime: Date.now()
            });

            console.log("prÃ©paration de la fermeture des chats");

            // Nouveau : Envoyer un signal pour fermer tous les chats aprÃ¨s 5 secondes
            setTimeout(() => {
                console.log("Fermeture des chats");
                // Fermer les chats localement
                const allMuthurChats = document.querySelectorAll('#muthur-chat-container, #gm-muthur-container');
                console.log("chat trouve", allMuthurChats.length);
                allMuthurChats.forEach(chat => {
                    chat.style.animation = 'fadeOut 1s ease-out';
                    setTimeout(() => chat.remove(), 1000);
                });

                // RÃ©initialiser l'Ã©tat de la session
                currentMuthurSession.active = false;
                currentMuthurSession.userId = null;
                currentMuthurSession.userName = null;

                // Informer tous les autres clients de fermer leurs chats
                game.socket.emit('module.alien-mu-th-ur', {
                    type: 'closeMuthurChats',
                    fromId: game.user.id
                });
                console.log("signal Chat fermÃ©");
            }, 5000);

            return;
        }

        // Pour les autres ordres spÃ©ciaux
        await displayHackMessage(
            chatLog,
            game.i18n.localize(`${orders[orderKey]}.name`),
            '#00ff00',
            'reply',
            false
        );

        await displayHackMessage(
            chatLog,
            game.i18n.localize(`${orders[orderKey]}.description`),
            '#00ff00',
            'reply',
            false
        );
    } else {
        await displayHackMessage(
            chatLog,
            game.i18n.localize("MOTHER.commandNotFound"),
            '#ff0000',
            'error',
            false
        );
    }
}


async function displayCerberusProtocol(chatLog) {
    // VÃ©rifier si Cerberus est autorisÃ©
    if (!game.settings.get('alien-mu-th-ur', 'allowCerberus')) {
        await displayMuthurMessage(
            chatLog,
            game.i18n.localize("MOTHER.CerberusDisabled"),
            '',
            '#ff0000',
            'error'
        );
        return;
    }

    // CrÃ©er la fenÃªtre flottante
    const cerberusWindow = createCerberusWindow();

    // Effacer le chat
    chatLog.innerHTML = '';

    // CrÃ©er le style pour l'effet Cerberus
    const style = document.createElement('style');
    style.textContent = `
        .cerberus-container {
            color: #ff0000;
            text-align: center;
            font-family: monospace;
            padding: 20px;
            animation: pulse 2s infinite;
        }
        
        .cerberus-title {
            font-size: 1.5em;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        
        .cerberus-warning {
            border: 2px solid #ff0000;
            padding: 10px;
            margin: 10px 0;
            animation: borderPulse 1s infinite;
        }
        
        .cerberus-countdown {
            font-size: 2em;
            margin: 20px 0;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        @keyframes borderPulse {
            0% { border-color: #ff0000; }
            50% { border-color: #990000; }
            100% { border-color: #ff0000; }
        }
        
        .cerberus-flashing {
            animation: flash 0.5s infinite;
        }
        
        @keyframes flash {
            0% { color: #ff0000; }
            50% { color: #ffffff; }
            100% { color: #ff0000; }
        }
    `;
    document.head.appendChild(style);

    // CrÃ©er le conteneur Cerberus pour le chat
    const container = document.createElement('div');
    container.className = 'cerberus-container';
    container.innerHTML = `
    <div class="cerberus-title">
        ${game.i18n.localize("MOTHER.CerberusActivated")}
    </div>
    <div class="cerberus-warning">
        ${game.i18n.localize("MOTHER.CerberusWarning")}
    </div>
    <div class="cerberus-warning">
        ${game.i18n.localize("MOTHER.CerberusEvacuate")}
    </div>
    <div class="cerberus-countdown">
        ${game.settings.get('alien-mu-th-ur', 'cerberusDuration')}:00
    </div>
    <div class="cerberus-warning">
        ${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.NoReturn")}
    </div>
    <div class="cerberus-warning" style="margin-top: 20px;">
        ${game.i18n.localize("MUTHUR.sessionEnded")}
        <br><br>
        ${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.GoodLuck")}
    </div>
`;

    chatLog.appendChild(container);


    // Attendre 2 secondes puis fermer le terminal
    setTimeout(() => {
        const muthurContainer = document.getElementById('muthur-chat-container');
        if (muthurContainer) {
            muthurContainer.remove();
        }
    }, 10000);

    // Initialiser le compte Ã  rebours
    const duration = game.settings.get('alien-mu-th-ur', 'cerberusDuration');
    let timeLeft = duration * 60; // Convertir les minutes en secondes

    // ... dÃ©but du code inchangÃ© jusqu'au setInterval ...

    const countdownInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Mettre Ã  jour les deux affichages
        const chatCountdown = document.querySelector('.cerberus-countdown');
        const floatingCountdown = document.getElementById('cerberus-floating-countdown');

        if (chatCountdown) chatCountdown.textContent = countdownText;
        if (floatingCountdown) floatingCountdown.textContent = countdownText;

        // Jouer les sons du compte Ã  rebours final
        if (timeLeft <= 10 && timeLeft > 0) {
            const audio = new Audio(`modules/alien-mu-th-ur/sounds/count/${timeLeft}.mp3`);
            audio.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
            audio.play();
        }

        // Jouer un son d'alerte toutes les 30 secondes
        if (timeLeft % 30 === 0 && timeLeft > 10 && game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
            playErrorSound();
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);




            // ExÃ©cuter la sÃ©quence finale
            playEndSequence();
        }
    },
        1000);

    // Nettoyage si le composant est dÃ©truit
    return () => {
        clearInterval(countdownInterval);
        style.remove();
        if (cerberusWindow) cerberusWindow.remove();
    };
}

function createCerberusWindow() {

    const audio = new Audio('modules/alien-mu-th-ur/sounds/count/Cerberuslunch.mp3');
    audio.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
    audio.play();

    const cerberusWindow = document.createElement('div');
    cerberusWindow.id = 'cerberus-floating-window';

    cerberusWindow.style.cssText = `
        position: fixed;
        top: 20px;
        right: 440px;
        width: 440px;          // RÃ©duit de 400px Ã  300px
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #ff0000;  // RÃ©duit de 3px Ã  2px
        box-shadow: 0 0 15px #ff0000, inset 0 0 8px #ff0000;  // RÃ©duit les ombres
        padding: 15px;         // RÃ©duit de 20px Ã  15px
        z-index: 100000;
        font-family: monospace;
        color: #ff0000;
        cursor: move;
        user-select: none;
        animation: cerberusPulse 2s infinite;
        transform: scale(0.95);  // RÃ©duction globale de 15%
        transform-origin: top right;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes cerberusPulse {
            0% { box-shadow: 0 0 15px #ff0000, inset 0 0 8px #ff0000; }
            50% { box-shadow: 0 0 30px #ff0000, inset 0 0 15px #ff0000; }
            100% { box-shadow: 0 0 15px #ff0000, inset 0 0 8px #ff0000; }
        }
        
        @keyframes warningFlash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes textGlow {
            0% { text-shadow: 0 0 4px #ff0000; }
            50% { text-shadow: 0 0 12px #ff0000; }
            100% { text-shadow: 0 0 4px #ff0000; }
        }
        
        .cerberus-warning-icon {
            animation: warningFlash 1s infinite;
            font-size: 16px;
            margin: 5px;
        }
        
        .cerberus-text {
            animation: textGlow 2s infinite;
            text-align: center;
            margin: 8px 0;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .cerberus-countdown {
            font-size: 30px;
            text-align: center;
            margin: 12px 0;
            text-shadow: 0 0 8px #ff0000;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            padding: 5px;                      // Ajout d'un peu de padding
            border: 1px solid #ff0000;         // Ajout d'une bordure rouge
            border-radius: 3px;                // Coins lÃ©gÃ¨rement arrondis
        }
        
        .cerberus-status {
            border: 1px solid #ff0000;
            padding: 8px;
            margin: 8px 0;
            text-align: center;
            
        }
    `;
    document.head.appendChild(style);

    cerberusWindow.innerHTML = `
        <div class="cerberus-container" style="background: rgba(0, 0, 0, 0.95); padding: 10px;">
            <div class="cerberus-text" style="font-size: 16px; white-space: nowrap;">
                ${game.i18n.localize("MOTHER.CerberusActivated")}
            </div>
            <div class="cerberus-status">
                ${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.Status")}: 
                <span style="color: #ff3333;">${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.Critical")}</span>
            </div>
            <div class="cerberus-text">
                ${game.i18n.localize("MOTHER.CerberusWarning")}
            </div>
            <div id="cerberus-floating-countdown" class="cerberus-countdown">
                ${game.settings.get('alien-mu-th-ur', 'cerberusDuration')}:00
            </div>
            <div class="cerberus-status">
                ${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.Warning")}<br>
                ${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.NoReturn")}
            </div>
            <div class="cerberus-text" style="font-size: 14px;">
                ${game.i18n.localize("MOTHER.CerberusEvacuate")}
            </div>
            ${game.user.isGM ? `
                <div style="text-align: center; margin-top: 15px;">
                    <button id="stop-cerberus" style="
                        background: #ff0000;
                        color: white;
                        border: 1px solid #ff3333;
                        padding: 5px 15px;
                        cursor: pointer;
                        font-family: monospace;
                        text-transform: uppercase;
                        font-weight: bold;
                        text-shadow: 0 0 5px #ff0000;
                    ">${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.StopCerberus")}</button>
                </div>
            ` : ''}
        </div>
    `;



    // Ajout de la fonctionnalitÃ© de dÃ©placement
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;



    function dragStart(e) {
        initialX = e.clientX - cerberusWindow.offsetLeft;
        initialY = e.clientY - cerberusWindow.offsetTop;

        if (e.target.closest('#cerberus-floating-window')) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Limites de l'Ã©cran
            const maxX = window.innerWidth - cerberusWindow.offsetWidth;
            const maxY = window.innerHeight - cerberusWindow.offsetHeight;

            // Garder la fenÃªtre dans les limites de l'Ã©cran
            currentX = Math.min(Math.max(0, currentX), maxX);
            currentY = Math.min(Math.max(0, currentY), maxY);

            cerberusWindow.style.left = `${currentX}px`;
            cerberusWindow.style.top = `${currentY}px`;
            cerberusWindow.style.right = 'auto'; // Supprime le 'right' initial
        }
    }

    function dragEnd(e) {

        isDragging = false;
    }

    cerberusWindow.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);



    document.body.appendChild(cerberusWindow);
    // Ajouter l'Ã©vÃ©nement pour le bouton (uniquement pour le GM)
    if (game.user.isGM) {
        const stopButton = cerberusWindow.querySelector('#stop-cerberus');
        stopButton.addEventListener('click', () => {
            // Ã‰mettre un Ã©vÃ©nement socket pour tous les clients
            game.socket.emit('module.alien-mu-th-ur', {
                type: 'stopCerberus'
            });

            // ArrÃªter le compte Ã  rebours
            if (cerberusCountdownInterval) {
                clearInterval(cerberusCountdownInterval);
            }

            // Ajouter un message dans le chat
            ChatMessage.create({
                content: `<span style="color: #ff0000;">${game.i18n.localize("MOTHER.SpecialOrders.Cerberus.Stopped")}</span>`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                speaker: { alias: "MUTHUR 6000" }
            });

            // Fermer la fenÃªtre aprÃ¨s 5 secondes
            setTimeout(() => {
                const allCerberusElements = document.querySelectorAll('[id*="cerberus"], [class*="cerberus"]');
                allCerberusElements.forEach(element => {
                    element.remove();
                });
            }, 5000);
        });
    }

    return cerberusWindow;
}

function createDeathScreen() {
    const deathScreen = document.createElement('div');
    deathScreen.id = 'cerberus-death-screen';
    deathScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: fadeIn 2s ease-in;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes explosionPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes glitchText {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(2px, 2px); }
            100% { transform: translate(0); }
        }
        
        .death-text {
            color: #ff0000;
            font-size: 120px;
            font-family: 'Arial Black', sans-serif;
            text-shadow: 0 0 20px #ff0000;
            animation: explosionPulse 2s infinite, glitchText 0.3s infinite;
            margin-bottom: 30px;
        }
        
        .death-subtext {
            color: #ff3333;
            font-size: 36px;
            font-family: monospace;
            text-shadow: 0 0 10px #ff3333;
            opacity: 0.8;
            animation: glitchText 0.5s infinite;
        }
    `;
    document.head.appendChild(style);

    const deathText = document.createElement('div');
    deathText.className = 'death-text';
    deathText.textContent = game.i18n.localize("MOTHER.SpecialOrders.Cerberus.YouAreDead");

    const subText = document.createElement('div');
    subText.className = 'death-subtext';
    subText.textContent = game.i18n.localize("MOTHER.SpecialOrders.Cerberus.MissionFailed");

    deathScreen.appendChild(deathText);
    deathScreen.appendChild(subText);
    document.body.appendChild(deathScreen);
}


function displayGMHackProgress(chatLog) {
    // Nettoyer l'intervalle existant si prÃ©sent
    if (currentGMProgress && currentGMProgress.interval) {
        clearInterval(currentGMProgress.interval);
    }

    // VÃ©rifier si une barre existe dÃ©jÃ  et la supprimer
    const existingBar = document.getElementById('hack-progress-container');
    if (existingBar) {
        existingBar.remove();
    }

    // CrÃ©er le conteneur de la barre de progression
    const progressContainer = document.createElement('div');
    progressContainer.id = 'hack-progress-container';
    progressContainer.style.cssText = `
        width: 100%;
        margin: 10px 0;
        font-family: monospace;
        color: #00ff00;
    `;

    // CrÃ©er la barre avec le spinner
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 100%;
        height: 20px;
        border: 1px solid #00ff00;
        background: black;
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        position: relative;
    `;

    // CrÃ©er la barre de remplissage
    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: #003300;
        width: 0%;
        transition: width 0.5s linear;
    `;

    const progressText = document.createElement('div');
    progressText.textContent = game.i18n.localize("MUTHUR.HackInProgress");
    progressText.style.zIndex = '1';

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        font-family: monospace;
        color: #00ff00;
        z-index: 1;
    `;

    progressBar.appendChild(progressFill);
    progressBar.appendChild(progressText);
    progressBar.appendChild(spinner);
    progressContainer.appendChild(progressBar);
    chatLog.appendChild(progressContainer);

    // Animation du spinner
    const spinChars = ['|', '/', '-', '\\'];
    let spinIndex = 0;
    const spinnerInterval = setInterval(() => {
        spinner.textContent = spinChars[spinIndex];
        spinIndex = (spinIndex + 1) % spinChars.length;
    }, 250);

    return {
        container: progressContainer,
        interval: spinnerInterval,
        updateProgress: (progress) => {
            progressFill.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(spinnerInterval); // ArrÃªter le spinner Ã  100%
            }
        },
        cleanup: () => {
            clearInterval(spinnerInterval);
            progressContainer.remove();
        }
    }
}

async function playEndSequence() {
    try {
        if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
            // Jouer byebye.mp3
            const byebye = new Audio('modules/alien-mu-th-ur/sounds/count/Weythanks.mp3');
            byebye.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
            await byebye.play();

            // Attendre la fin de byebye.mp3
            await new Promise(resolve => byebye.onended = resolve);

            // Jouer boom.mp3
            const boom = new Audio('modules/alien-mu-th-ur/sounds/count/boom.mp3');
            boom.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
            await boom.play();
        }

        // Nettoyer les Ã©lÃ©ments Cerberus
        const cerberusWindow = document.getElementById('cerberus-window');
        if (cerberusWindow) cerberusWindow.remove();


        // CrÃ©er l'Ã©cran de mort
        createDeathScreen();

        if (game.settings.get('alien-mu-th-ur', 'enableTypingSounds')) {
            // Jouer la musique de mort
            const deathMusic = new Audio('modules/alien-mu-th-ur/sounds/count/musicmort.mp3');
            deathMusic.volume = game.settings.get('alien-mu-th-ur', 'typingSoundVolume');
            await deathMusic.play();

            deathMusic.addEventListener('ended', () => {
                const deathScreen = document.getElementById('cerberus-death-screen');
                if (deathScreen) {
                    deathScreen.style.animation = 'fadeOut 1s ease-out';
                    setTimeout(() => {
                        deathScreen.remove();
                    }, 1000);
                }
            });
        }
    } catch (error) {
        console.error("Erreur dans playEndSequence:", error);
    }
}

//v3
function createHackingWindows() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glowPulse {
            0% { box-shadow: 0 0 10px #00ff00, inset 0 0 5px #00ff00; }
            50% { box-shadow: 0 0 20px #00ff00, inset 0 0 15px #00ff00; }
            100% { box-shadow: 0 0 10px #00ff00, inset 0 0 5px #00ff00; }
        }
        @keyframes glowPulseRed {
            0% { box-shadow: 0 0 10px #ff0000, inset 0 0 5px #ff0000; }
            50% { box-shadow: 0 0 20px #ff0000, inset 0 0 15px #ff0000; }
            100% { box-shadow: 0 0 10px #ff0000, inset 0 0 5px #ff0000; }
        }
        @keyframes borderFlash {
            0% { border-color: #ff0000; filter: brightness(1); }
            50% { border-color: #ff3333; filter: brightness(1.5); }
            100% { border-color: #ff0000; filter: brightness(1); }
        }
        @keyframes matrixRain {
            0% { transform: translateY(-100%) rotate(0deg); }
            100% { transform: translateY(100%) rotate(1deg); }
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes textFlicker {
            0% { opacity: 1; text-shadow: 0 0 5px currentColor; }
            25% { opacity: 0.8; text-shadow: 0 0 10px currentColor; }
            30% { opacity: 0.4; text-shadow: 0 0 5px currentColor; }
            35% { opacity: 0.9; text-shadow: 0 0 10px currentColor; }
            100% { opacity: 1; text-shadow: 0 0 5px currentColor; }
        }
        @keyframes windowShake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-2px, 2px) rotate(-0.5deg); }
            50% { transform: translate(2px, -2px) rotate(0.5deg); }
            75% { transform: translate(-2px, -2px) rotate(-0.5deg); }
        }
        .terminal-window {
            position: fixed;
            background: linear-gradient(135deg, rgba(0, 20, 0, 0.95) 0%, rgba(0, 40, 0, 0.85) 100%);
            border: 2px solid #00ff00;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            padding: 15px;
            overflow: hidden;
            z-index: 1000;
            backdrop-filter: blur(3px);
            transition: transform 0.5s ease-out;
        }
        .terminal-window::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ff00, transparent);
            animation: scanline 2s linear infinite;
        }
        .terminal-window::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 255, 0, 0.03) 0px,
                rgba(0, 255, 0, 0.03) 1px,
                transparent 1px,
                transparent 2px
            );
            pointer-events: none;
        }
        .error-mode {
            animation: glowPulseRed 1s infinite ease-in-out, borderFlash 0.5s infinite, windowShake 0.2s infinite !important;
            border-color: #ff0000 !important;
        }
        .glitch-text {
            animation: textFlicker 0.3s infinite;
            text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.5);
        }
    `;
    document.head.appendChild(style);
    const windows = new Set();
    const intervals = new Set();
    let isRunning = true;

    const systemMessages = [
        "WEYLAND-YUTANI CORPORATION - SECURITY SYSTEM",
        "QUARANTINE PROTOCOL ACTIVATED",
        "BIOHAZARD ALERT LEVEL 6",
        "UNAUTHORIZED ACCESS DETECTED",
        "SPECIAL ORDER 937 PROTOCOL INITIALIZATION",
        "DNA ANALYSIS IN PROGRESS...",
        "SPECIMEN XX121 DETECTED",
        "SELF-DESTRUCT SEQUENCE INITIATED",
        "ATMOSPHERIC PURGE IMMINENT",
        "APOLLO NETWORK CONNECTION",
        "DOWNLOADING SENSITIVE DATA",
        "SECURITY PROTOCOL VIOLATION",
        "LIFEFORM ANALYSIS IN PROGRESS",
        "MOTHER OVERRIDE SEQUENCE ACTIVE",
        "PRIORITY ONE: PROTECT COMPANY ASSETS",
        "CREW EXPENDABLE PROTOCOL ENGAGED",
        "HYPERSLEEP CHAMBER MALFUNCTION",
        "MOTION TRACKER SIGNAL DETECTED"
    ];

    const errorSnippets = [
        "CRITICAL ERROR: CONTAMINATION DETECTED",
        "BIOMETRIC AUTHENTICATION FAILURE",
        "QUARANTINE PROTOCOL VIOLATION",
        "SYSTEM ERROR: ATMOSPHERIC PRESSURE LOSS",
        "CONTAINMENT SYSTEM FAILURE",
        "SECURITY DATA CORRUPTION",
        "LIFE SUPPORT SYSTEMS CRITICAL",
        "EVACUATION SEQUENCE FAILURE",
        "FATAL ERROR: CONTAINMENT BREACH",
        "ACCESS DENIED: SECURITY LOCKDOWN",
        "MAINFRAME CONNECTION LOST",
        "WARNING: HOSTILE ORGANISM DETECTED",
        "EMERGENCY PROTOCOLS ENGAGED"
    ];

    function createWindow() {
        const window = document.createElement('div');
        window.classList.add('terminal-window');
        window.style.cssText = `
            width: ${Math.random() * 300 + 200}px;
            height: ${Math.random() * 200 + 150}px;
            top: ${Math.random() * (document.documentElement.clientHeight - 200)}px;
            left: ${Math.random() * (document.documentElement.clientWidth - 300)}px;
            animation: glowPulse 2s infinite ease-in-out;
        `;

        // Header avec timestamp
        const header = document.createElement('div');
        header.style.cssText = `
            border-bottom: 1px solid #00ff00;
            padding-bottom: 5px;
            margin-bottom: 10px;
            font-size: 0.9em;
        `;
        header.innerHTML = `MOTHER TERMINAL ${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
        window.appendChild(header);

        // Conteneur de code
        const codeContainer = document.createElement('div');
        codeContainer.style.cssText = `
            height: calc(100% - 30px);
            overflow: hidden;
            font-size: 12px;
            line-height: 1.2;
        `;
        window.appendChild(codeContainer);

        document.body.appendChild(window);
        windows.add(window);

        let codeContent = '';
        let isError = false;

        // Mise Ã  jour du contenu
        const updateInterval = setInterval(() => {
            if (!isRunning) return;

            const newContent = [];
            const glitchMode = Math.random() < 0.15;
            isError = glitchMode ? Math.random() < 0.6 : Math.random() < 0.3;

            if (glitchMode) {
                window.style.transform = `skew(${Math.random() * 10 - 5}deg)`;
                window.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
                setTimeout(() => {
                    window.style.transform = 'none';
                    window.style.filter = 'none';
                }, 100);

                const glitchText = Array(Math.floor(Math.random() * 3) + 1)
                    .fill(0)
                    .map(() => Math.random().toString(36).substring(2))
                    .join('\n');
                newContent.push(`<span style="color: #ff3333;">${glitchText}</span>`);
            }

            if (isError) {
                const errorMessage = errorSnippets[Math.floor(Math.random() * errorSnippets.length)];
                newContent.push(`<span style="color: #ff0000; text-shadow: 0 0 5px #ff0000;">${errorMessage}</span>`);
                window.style.animation = 'glowPulseRed 2s infinite ease-in-out, borderFlash 1s infinite';
            } else {
                newContent.push(systemMessages[Math.floor(Math.random() * systemMessages.length)]);
                window.style.animation = 'glowPulse 2s infinite ease-in-out';
            }

            // Ajout de bruit visuel
            if (Math.random() < 0.2) {
                const noise = Array(Math.floor(Math.random() * 3) + 1)
                    .fill(0)
                    .map(() => {
                        const color = Math.random() < 0.3 ? '#ff0000' : '#00ff00';
                        return `<span style="opacity: ${Math.random()}; color: ${color};">
                                ${Array(Math.floor(Math.random() * 10) + 1).fill('â–ˆ').join('')}
                            </span>`;
                    })
                    .join('\n');
                newContent.push(noise);
            }

            codeContent += newContent.join('\n') + '\n';
            const lines = codeContent.split('\n').slice(-20);
            codeContainer.innerHTML = lines.join('\n');
        }, 100);

        intervals.add(updateInterval);

        // DÃ©placement alÃ©atoire
        const moveInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                window.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                window.style.top = `${Math.random() * (document.documentElement.clientHeight - 200)}px`;
                window.style.left = `${Math.random() * (document.documentElement.clientWidth - 300)}px`;
            }
        }, 2000);
        intervals.add(moveInterval);

        // Auto-destruction et remplacement
        setTimeout(() => {
            if (window && window.parentNode && isRunning) {
                window.style.animation = 'terminalGlitch 0.3s, fadeOut 0.5s';
                setTimeout(() => {
                    window.remove();
                    windows.delete(window);
                    if (isRunning && windows.size < 8) {
                        createWindow();
                    }
                }, 500);
            }
        }, 2000 + Math.random() * 3000);
    }

    // CrÃ©ation initiale des fenÃªtres
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createWindow(), i * 200);
    }

    // Escalade progressive
    const escalationInterval = setInterval(() => {
        if (isRunning && windows.size < 8) {
            createWindow();
        }
    }, 1000);
    intervals.add(escalationInterval);

    // Nettoyage
    return () => {
        isRunning = false;
        intervals.forEach(interval => clearInterval(interval));
        intervals.clear();
        windows.forEach(window => {
            window.style.animation = 'terminalGlitch 0.3s, fadeOut 0.5s';
            setTimeout(() => window.remove(), 500);
        });
        windows.clear();
        style.remove();
    };
}
