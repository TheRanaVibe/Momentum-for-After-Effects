// --- Momentum by RANA (v1.1.3 - Gold Master Release) ---
// A professional workflow system for Adobe After Effects to add and manage lifelike secondary motion.
// This is the final, launch-ready version, hardened against all critical pre-launch failure scenarios.

(function(thisObj) {

    // --- MASTER SCRIPT OBJECT ---
    var MotionEngine = {

        config: {
            scriptName: "Momentum",
            version: "1.0.0",
            userPresetsFilePath: Folder.userData.fsName + "/MomentumUserPresets.json",
            socials: {
                twitter: { title: "Connect on X (Twitter)", url: "https://x.com/vibe_like_rana" },
                community: { title: "Community & Support Hub", url: "https://github.com/TheRanaVibe/Momentum-for-After-Effects" },
                updates: { title: "Check for Updates", url: "https://github.com/TheRanaVibe/Momentum-for-After-Effects/releases" }
            },
            bounceConfig: {
                scriptName: "Dynamic Bounce Rig v1.0", rigPrefix: "Bounce | ", masterControl: { name: "Enable", presetKey: "enable", fallback: 1 },
                rigControls: [ { name: "Bounciness",  presetKey: "elasticity",  fallback: 0.5 }, { name: "Frequency",   presetKey: "stiffness",   fallback: 0.6 }, { name: "Decay", presetKey: "dissipation", fallback: 7.0 } ]
            },
            snsConfig: {
                scriptName: "Preset Intensity SnS Engine v1.0", rigPrefix: "SnS | ", masterControl: { name: "Enable", presetKey: "enable", fallback: 1 },
                rigControls: [ { name: "Master Intensity", presetKey: "intensity", fallback: 100 }, { name: "Stretchiness", presetKey: "stretch", fallback: 70 }, { name: "Impact Jiggle", presetKey: "jiggle", fallback: 80 }, { name: "Dampening", presetKey: "dampen", fallback: 4 }, { name: "Mass", presetKey: "mass", fallback: 100 } ]
            },
            wiggleConfig: {
                scriptName: "Dynamic Wiggle Rig v1.0",
                rigPrefix: "Wiggle | ", 
                masterControl: { name: "Enable", presetKey: "enable", fallback: 1 },
                rigControls: [ 
                    { name: "Intensity",   presetKey: "intensity", fallback: 100.0 }, 
                    { name: "Frequency",   presetKey: "freq",    fallback: 2.0 }, 
                    { name: "Amplitude",   presetKey: "amp",     fallback: 25.0 }, 
                    { name: "Detail",  presetKey: "complex", fallback: 3.0 }, 
                    { name: "Random Seed", presetKey: "seed",    fallback: 0.0 },
                    { name: "Loop", presetKey: "loop", fallback: 0.0 }, 
                    { name: "Loop Duration", presetKey: "loopTime", fallback: 2.0 } 
                ]
            },
            controllerName: "[Momentum Ctrl] " 
        },
        data: {
            userPresets: { bounce: {}, sns: {}, wiggle: {} },
            clipboard: { type: null, values: {} }, 
            bypassStates: [],
            isSoloed: false,
            activeRigs: { bounce: false, sns: false, wiggle: false },
            bouncePresetData: {
                "0. Very Subtle": { elasticity: 0.1, stiffness: 0.8, dissipation: 8.0 },
                "1. Subtle Bounce": { elasticity: 0.25, stiffness: 0.6, dissipation: 7.0 }, 
                "2. Classic Cartoon": { elasticity: 0.6,  stiffness: 0.5, dissipation: 5.0 }, 
                "3. Heavy Drop": { elasticity: 0.1,  stiffness: 0.2, dissipation: 4.0 }, 
                "4. Super Ball": { elasticity: 0.9,  stiffness: 0.8, dissipation: 2.0 }, 
                "5. Wobble Settle": { elasticity: 0.3,  stiffness: 0.9, dissipation: 9.0 }, 
                "6. Elastic Overshoot": { elasticity: 1.2,  stiffness: 0.4, dissipation: 4.5 },
                "7. Sharp Impact": { elasticity: 0.1, stiffness: 2.5, dissipation: 3.0 }
            },
            snsPresetData: {
                "0. Very Subtle": { intensity: 100, stretch: 5,   jiggle: 10,  dampen: 9.0, mass: 100 },
                "1. Subtle Realism": { intensity: 100, stretch: 10,  jiggle: 20,  dampen: 8.0, mass: 100 }, 
                "2. Toon Physics": { intensity: 100, stretch: 70,  jiggle: 80,  dampen: 4.0, mass: 100 }, 
                "3. Liquid Blob": { intensity: 100, stretch: 60,  jiggle: 100, dampen: 2.0, mass: 50 }, 
                "4. Snappy Elastic": { intensity: 100, stretch: 100, jiggle: 50,  dampen: 9.0, mass: 75 }, 
                "5. Heavy Weight": { intensity: 100, stretch: 5,   jiggle: 10,  dampen: 6.0, mass: 100 }
            },
            wigglePresetData: {
                "0. Very Subtle":     { intensity: 100, freq: 3.0,  amp: 2.0,   complex: 1.0, seed: 0, loop: 0, loopTime: 2 },
                "1. Subtle Tremor":     { intensity: 100, freq: 5.0,  amp: 5.0,   complex: 3.0, seed: 0, loop: 0, loopTime: 2 }, 
                "2. Energetic Jitter":  { intensity: 100, freq: 15.0, amp: 8.0,   complex: 5.0, seed: 0, loop: 0, loopTime: 2 }, 
                "3. Drifting Float":    { intensity: 100, freq: 0.5,  amp: 75.0,  complex: 1.0, seed: 0, loop: 0, loopTime: 2 }, 
                "4. Complex Vibration": { intensity: 100, freq: 4.0,  amp: 20.0,  complex: 8.0, seed: 0, loop: 0, loopTime: 2 }, 
                "5. Hand-held Camera":  { intensity: 100, freq: 1.5,  amp: 15.0,  complex: 2.0, seed: 0, loop: 0, loopTime: 2 }, 
                "6. Glitchy Twitch":    { intensity: 100, freq: 20.0, amp: 2.0,   complex: 1.0, seed: 0, loop: 0, loopTime: 2 }
            }
        },
        core: {
            JSON: (function() { if (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') { return JSON; } var f=Object.prototype.toString;return{parse:function(a){return eval("("+a+")")},stringify:function(a){var c,d,e;if(null===a||"boolean"===typeof a||"number"===typeof a)return String(a);c=f.call(a);if("[object Array]"===c){for(d="[",e=0;e<a.length;e++)d+=(0<e?",":"")+this.stringify(a[e]);return d+"]"}if("[object Object]"===c){d="{";e=Object.keys(a);for(var h=0;h<e.length;h++){var k=e[h];d+=(0<h?",":"")+'"'+k+'":'+this.stringify(a[k])}return d+"}"}return'"'+String(a).replace(/"/g,"\\\"")+'"'}}}()),
            openURL: function(url) {
                var command;
                if ($.os.indexOf("Windows") !== -1) {
                    command = "cmd.exe /c start " + url;
                } else {
                    command = "open " + url;
                }
                try {
                    system.callSystem(command);
                } catch (e) {
                    alert("Could not open URL.");
                }
            },
            isValidContext: function() {
                if (!app.project) {
                    alert("Please open a project first.");
                    return false;
                }
                if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
                    alert("Please select a composition.");
                    return false;
                }
                return true;
            },
            loadUserPresets: function() { var file = new File(MotionEngine.config.userPresetsFilePath); if (file.exists) { file.open("r"); var content = file.read(); file.close(); try { var presets = MotionEngine.core.JSON.parse(content); MotionEngine.data.userPresets.bounce = presets.bounce || {}; MotionEngine.data.userPresets.sns = presets.sns || {}; MotionEngine.data.userPresets.wiggle = presets.wiggle || {}; } catch(e) { MotionEngine.data.userPresets = { bounce: {}, sns: {}, wiggle: {} }; } } },
            saveUserPresets: function() { var file = new File(MotionEngine.config.userPresetsFilePath); try { file.open("w"); file.write(MotionEngine.core.JSON.stringify(MotionEngine.data.userPresets)); file.close(); } catch(e) { alert("Could not save user presets to:\n" + file.fsName); } },
            generateBounceExpression: function() {
                var config = MotionEngine.config.bounceConfig;
                var pointers = ["// -- " + config.scriptName + " --", "var p_enable = 1; try { p_enable = effect('" + config.rigPrefix + config.masterControl.name + "')('Checkbox').value; } catch(e){}"];
                for (var i = 0; i < config.rigControls.length; i++) { var control = config.rigControls[i]; var varName = "p_" + control.presetKey; pointers.push("var " + varName + " = " + control.fallback + ";"); pointers.push("try { " + varName + " = effect('" + config.rigPrefix + control.name + "')('Slider'); } catch(e){}"); }
                var logic = pointers.concat([
                    "", "if(p_enable){", "try {", "var prop = (thisLayer.hasParent) ? thisLayer.parent.transform.position : thisProperty;", "var n = 0;", "if (prop.numKeys > 0){ n = prop.nearestKey(time).index; if (prop.key(n).time > time){ n-- } }", "if (n > 0){", "var t = time - prop.key(n).time;", "var v = prop.velocityAtTime(prop.key(n).time - 0.001);", "var v_mag = 0;", "if (v.constructor === Array) { v_mag = length(v); } else { v_mag = Math.abs(v); }", "if (v_mag < 0.001) { value; } else {", "var amp = v_mag * p_elasticity;", "var freq = 1 / ((p_stiffness > 0 ? p_stiffness : 0.001) * 0.1);", "var decay = p_dissipation;", "value + (v/v_mag) * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);", "}", "} else { value; }", "} catch (e) { value; }", "} else { value; }"
                ]).join('\n');
                return logic;
            },
            generateSnSExpressions: function(isInverted) {
                isInverted = (isInverted === true);
                var config = MotionEngine.config.snsConfig;
                var pointers = ["// -- " + config.scriptName + " --", "var p_enable = 1; try { p_enable = effect('" + config.rigPrefix + config.masterControl.name + "')('Checkbox').value; } catch(e){}"];
                for (var i = 0; i < config.rigControls.length; i++) { var control = config.rigControls[i]; var varName = "p_" + control.presetKey; pointers.push("var " + varName + " = " + control.fallback + ";"); pointers.push("try { " + varName + " = effect('" + config.rigPrefix + control.name + "')('Slider'); } catch(e){}"); }
                
                var scalePrimaryAxis, scaleSecondaryAxis, impactPrimaryAxis, impactSecondaryAxis;
                if (isInverted) {
                    scalePrimaryAxis = "scaleX_stretch"; scaleSecondaryAxis = "scaleY_squash";
                    impactPrimaryAxis = "scaleY_squash"; impactSecondaryAxis = "scaleX_stretch";
                } else {
                    scalePrimaryAxis = "scaleY_stretch"; scaleSecondaryAxis = "scaleX_squash";
                    impactPrimaryAxis = "scaleX_squash"; impactSecondaryAxis = "scaleY_stretch";
                }

                var scaleExpLines = [ "if(p_enable){", "  try{", "    var stretchAmount = linear(p_intensity, 0, 100, 0, p_stretch / 100);", "    var jiggleAmount = linear(p_intensity, 0, 100, 0, p_jiggle / 100);", "    var dampening = linear(p_intensity, 0, 100, 20, p_dampen);", "    var massInfluence = linear(p_intensity, 0, 100, 0, p_mass / 100);", "    var layerSize = 10000;", "    try{", "      var area = thisLayer.source.width * thisLayer.source.height;", "      var scaleFactor = transform.scale[0] / 100;", "      layerSize = area * scaleFactor;", "    }catch(e){}", "    var massImpact = Math.log(layerSize + 1) * massInfluence;", "    var pos = (thisLayer.hasParent) ? thisLayer.parent.transform.position : thisLayer.transform.position;", "    var speed = length(pos.velocity);", "    var maxStretch = (100 * stretchAmount) / (1 + massImpact / 25);",
                "    var " + scalePrimaryAxis + " = linear(speed, 0, 3000, 100, 100 + maxStretch);",
                "    var " + scaleSecondaryAxis + " = 10000 / " + scalePrimaryAxis + ";",
                "    var n = 0;", "    if(pos.numKeys > 0){", "      n = pos.nearestKey(time).index;", "      if(pos.key(n).time > time) n--;", "    }", "    if(n > 0){", "      var timeSinceImpact = time - pos.key(n).time;", "      if(timeSinceImpact < 1.5){", "        var impactSpeed = length(pos.velocityAtTime(pos.key(n).time - thisComp.frameDuration * 0.01));", "        var velocityFactor = clamp(impactSpeed / 3000, 0, 5);", "        var impactAmplitude = (50 + (150 * jiggleAmount)) * velocityFactor * (1 + massImpact / 20);", "        var effectiveDampening = (dampening + (velocityFactor * 5)) / (1 + massImpact / 15);", "        var impactEffect = impactAmplitude * Math.sin(effectiveDampening * timeSinceImpact * Math.PI) / Math.exp(effectiveDampening * timeSinceImpact * 2);",
                "        " + impactPrimaryAxis + " = Math.max(0.01, " + impactPrimaryAxis + " + impactEffect);",
                "        " + impactSecondaryAxis + " = Math.max(0.01, 10000 / " + impactPrimaryAxis + ");",
                "      }", "    }", "    var originalScale = value;",
                (isInverted ? "[originalScale[0] * scaleX_stretch / 100, originalScale[1] * scaleY_squash / 100];" : "[originalScale[0] * scaleX_squash / 100, originalScale[1] * scaleY_stretch / 100];"),
                "  }catch(e){", "    value", "  }", "}else{", "  value", "}" ];
                var scaleExp = pointers.concat(scaleExpLines).join('\n');
                var rotationExp = ["// -- " + config.scriptName + " (3D Safe Auto-Orient) --","try {","if (thisLayer.threeDLayer || !thisLayer.hasParent) {","value;","} else {","var p_enable = 1; try { p_enable = effect('" + config.rigPrefix + config.masterControl.name + "')('Checkbox').value; } catch(e){}","if(p_enable){","var vel = thisProperty.parent.transform.position.velocity;","if (length(vel) > 0.1) { radiansToDegrees(Math.atan2(vel[1], vel[0])); } else { value; }","} else { value; }","}} catch(e) {","value;","}"].join('\n');
                return { scale: scaleExp, rotation: rotationExp };
            },
            generateWiggleExpression: function() {
                var config = MotionEngine.config.wiggleConfig;
                var pointers = ["// -- " + config.scriptName + " --", "var p_enable = 1; try { p_enable = effect('" + config.rigPrefix + config.masterControl.name + "')('Checkbox').value; } catch(e){}"];
                
                for (var i = 0; i < config.rigControls.length; i++) { 
                    var control = config.rigControls[i]; 
                    var varName = "p_" + control.presetKey; 
                    pointers.push("var " + varName + " = " + control.fallback + ";"); 
                    if (control.presetKey === 'loop') {
                         pointers.push("try { " + varName + " = effect('" + config.rigPrefix + control.name + "')('Checkbox').value; } catch(e){}"); 
                    } else {
                         pointers.push("try { " + varName + " = effect('" + config.rigPrefix + control.name + "')('Slider'); } catch(e){}"); 
                    }
                }
                
                var logic = pointers.concat([ 
                    "", 
                    "if(p_enable){", 
                    "  try {", 
                    "    var final_amp = p_amp * (p_intensity / 100);",
                    "    if (p_loop) {",
                    "      var loopTime = Math.max(0.01, p_loopTime);",
                    "      var t = time % loopTime;",
                    "      var wiggle1 = wiggle(p_freq, final_amp, p_complex, 0.5, t);",
                    "      var wiggle2 = wiggle(p_freq, final_amp, p_complex, 0.5, t - loopTime);",
                    "      linear(t, 0, loopTime, wiggle1, wiggle2);",
                    "    } else {",
                    "      seedRandom(p_seed, true);", 
                    "      wiggle(p_freq, final_amp, p_complex);", 
                    "    }",
                    "  } catch (e) { value; }", 
                    "} else { value; }" 
                ]).join('\n');

                return logic;
            },
            installOrUpdateRig: function(targetLayer, presetProfile, rigConfig) {
                try {
                    var masterControlEffect = targetLayer.Effects.property(rigConfig.rigPrefix + rigConfig.masterControl.name);
                    if (!masterControlEffect) {
                        masterControlEffect = targetLayer.Effects.addProperty("Checkbox Control");
                        masterControlEffect.name = rigConfig.rigPrefix + rigConfig.masterControl.name;
                    }
                    masterControlEffect.property("Checkbox").setValue(true);
                    for (var i = 0; i < rigConfig.rigControls.length; i++) {
                        var control = rigConfig.rigControls[i];
                        var effectName = rigConfig.rigPrefix + control.name;
                        var effect = targetLayer.Effects.property(effectName);
                        
                        var propertyType = (control.presetKey === 'loop') ? "Checkbox Control" : "Slider Control";
                        var propertyKey = (control.presetKey === 'loop') ? "Checkbox" : "Slider";

                        if (!effect) {
                            effect = targetLayer.Effects.addProperty(propertyType);
                            effect.name = effectName;
                        }
                        var presetVal = presetProfile[control.presetKey] !== undefined ? presetProfile[control.presetKey] : control.fallback;
                        effect.property(propertyKey).setValue(presetVal);
                    }
                } catch(e) {
                    alert("Error installing rig on layer '" + targetLayer.name + "'. Is the layer locked?");
                }
            },
            removeRig: function(targetLayer, rigConfig) {
                try {
                    var allControls = [rigConfig.masterControl].concat(rigConfig.rigControls);
                    for (var i = 0; i < allControls.length; i++) {
                        try {
                            var effect = targetLayer.Effects.property(rigConfig.rigPrefix + allControls[i].name);
                            if (effect) effect.remove();
                        } catch (e) {}
                    }
                    var propsToCheck = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z", "ADBE Orientation"];
                    for (var j = 0; j < propsToCheck.length; j++) {
                        var prop = targetLayer.property("ADBE Transform Group").property(propsToCheck[j]);
                        if (prop && prop.canSetExpression && prop.expression !== "" && prop.expression.indexOf(rigConfig.scriptName) > -1) {
                            prop.expression = "";
                        }
                    }
                } catch (e) {
                    alert("Error removing rig from layer '" + targetLayer.name + "'. Is the layer locked?");
                }
            },
            simplifyPropertyKeyframes: function(prop, tolerance) { if (prop.numKeys < 3) return; for (var k = prop.numKeys - 1; k >= 2; k--) { try { var key1Time = prop.keyTime(k-1); var key2Time = prop.keyTime(k); var key3Time = prop.keyTime(k+1); var key1Val = prop.keyValue(k-1); var key2Val = prop.keyValue(k); var key3Val = prop.keyValue(k+1); var interpolatedVal = linear(key2Time, key1Time, key3Time, key1Val, key3Val); var isRedundant = false; if (key1Val instanceof Array) { var dist = 0; for(var i=0; i<key1Val.length; i++) { dist += Math.pow(interpolatedVal[i] - key2Val[i], 2); } if (Math.sqrt(dist) < tolerance) isRedundant = true; } else { if (Math.abs(interpolatedVal - key2Val) < tolerance) isRedundant = true; } if (isRedundant) prop.removeKey(k); } catch(e) {} } },
            
            createParentRig: function(layer, propToTransfer, rigName, resetValue) {
                var comp = app.project.activeItem;
                var targetLayer = layer;
                 if (layer.parent && layer.parent.name.indexOf(rigName) === 0) {
                    targetLayer = layer.parent;
                } else {
                    var nullCtrl = comp.layers.addNull();
                    nullCtrl.name = rigName + layer.name;
                    nullCtrl.moveBefore(layer);
                    
                    var layerProp = propToTransfer;
                    var nullProp = nullCtrl.property(layerProp.matchName);

                    if (nullProp) {
                        if (layerProp.expression) nullProp.expression = layerProp.expression;
                        for (var k = 1; k <= layerProp.numKeys; k++) { nullProp.setValueAtTime(layerProp.keyTime(k), layerProp.keyValue(k)); }
                        if (layerProp.numKeys === 0) nullProp.setValue(layerProp.value);
                        
                        layerProp.expression = "";
                        while (layerProp.numKeys > 0) { layerProp.removeKey(1); }
                        
                        try { layerProp.setValue(resetValue); } catch(e) {}
                        
                        layer.parent = nullCtrl;
                        targetLayer = nullCtrl;
                    }
                }
                return targetLayer;
            },

            bakeRig: function(originalLayer, rigConfigs, expressionMap, propertiesToBake, options) {
                var comp = app.project.activeItem;
                var layerToBake = originalLayer;

                if (options.duplicate) {
                    layerToBake = originalLayer.duplicate();
                    layerToBake.name = originalLayer.name.replace(/ \[RIG\]/g, "") + " [BAKED]";
                    originalLayer.name += " [RIG]";
                    originalLayer.enabled = false;
                }

                var startTime = comp.workAreaStart;
                var endTime = comp.workAreaStart + comp.workAreaDuration;
                var frameDuration = comp.frameDuration / options.samplingRate;
                
                var propsToProcess = {};

                for (var i = 0; i < propertiesToBake.length; i++) {
                    var propName = propertiesToBake[i];
                    var prop = layerToBake.property("ADBE Transform Group").property(propName);
                    if (prop && prop.canSetExpression) {
                        var expressionToApply = expressionMap[propName];
                        if (expressionToApply) {
                            prop.expression = expressionToApply;
                        }
                        propsToProcess[propName] = { property: prop, valueCache: [] };
                        for (var currentTime = startTime; currentTime <= endTime + (frameDuration / 2); currentTime += frameDuration) {
                            var bakedValue = prop.valueAtTime(currentTime, false);
                            propsToProcess[propName].valueCache.push({time: currentTime, value: bakedValue});
                        }
                    }
                }

                for (var propName in propsToProcess) {
                    if (propsToProcess.hasOwnProperty(propName)) {
                        var propToClean = propsToProcess[propName].property;
                        propToClean.expression = ""; 
                        while(propToClean.numKeys > 0) {
                            propToClean.removeKey(1);
                        }
                    }
                }

                for (var propName in propsToProcess) {
                    if (propsToProcess.hasOwnProperty(propName)) {
                        var currentPropData = propsToProcess[propName];
                        var currentProp = currentPropData.property;
                        var valueCache = currentPropData.valueCache;

                        if (options.useHold) {
                            for (var v = 0; v < valueCache.length; v++) {
                                if (v % options.holdRate === 0) {
                                    var keyTime = valueCache[v].time;
                                    var keyValue = valueCache[v].value;
                                    var keyIndex = currentProp.addKey(keyTime);
                                    currentProp.setValueAtKey(keyIndex, keyValue);
                                    currentProp.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD);
                                }
                            }
                        } else {
                            for (var v = 0; v < valueCache.length; v++) {
                                var keyTime = valueCache[v].time;
                                var keyValue = valueCache[v].value;
                                currentProp.setValueAtTime(keyTime, keyValue);
                            }
                            if (options.simplify) {
                                this.simplifyPropertyKeyframes(currentProp, 0.01);
                            }
                        }
                    }
                }

                for(var r = 0; r < rigConfigs.length; r++){
                    this.removeRig(layerToBake, rigConfigs[r]);
                }

                return layerToBake;
            },
            hasRequiredPermissions: function() { if (app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY") !== 1) { alert("Permission Error: Please enable 'Allow Scripts to Write Files and Access Network' in AE's Preferences > Scripting & Expressions.", "Permission Denied"); return false; } return true; }
        },
        actions: {
            getCurrentlySelectedRigType: function() {
                var pal = MotionEngine.ui.pal;
                if (!pal || !pal.rigTabs || pal.rigTabs.selection === null) return null;
                var activeTab = pal.rigTabs.selection;
                if (activeTab.text.indexOf("Bounce") > -1) { return 'bounce'; }
                if (activeTab.text.indexOf("Squash") > -1) { return 'sns'; }
                if (activeTab.text.indexOf("Wiggle") > -1) { return 'wiggle'; }
                return null;
            },
            applyRig: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var rigType = this.getCurrentlySelectedRigType();
                if (!rigType) return;
                MotionEngine.ui.showStatus("Ready.");
                if (rigType === 'bounce') { this.applyBounceRig(); }
                else if (rigType === 'sns') { this.applySnsRig(); }
                else if (rigType === 'wiggle') { this.applyWiggleRig(); }
                MotionEngine.ui.refreshForSelection();
            },
            removeRig: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var rigType = this.getCurrentlySelectedRigType();
                if (!rigType) return;
                MotionEngine.ui.showStatus("Ready.");
                if (rigType === 'bounce') { this.removeBounceRig(); }
                else if (rigType === 'sns') { this.removeSnsRig(); }
                else if (rigType === 'wiggle') { this.removeWiggleRig(); }
                MotionEngine.ui.refreshForSelection();
            },
            
            applyBounceRig: function() {
                var core = MotionEngine.core; var data = MotionEngine.data; var pal = MotionEngine.ui.pal; var ui = MotionEngine.ui; var bounceConfig = MotionEngine.config.bounceConfig;
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select at least one layer with keyframes."); return; }
                app.beginUndoGroup("Apply Dynamic Bounce Rig");
                var presetProfile; if (pal.bounceUserPresetDropdown.selection !== null) { presetProfile = data.userPresets.bounce[pal.bounceUserPresetDropdown.selection.text]; } else if (pal.bouncePresetDropdown.selection !== null) { presetProfile = data.bouncePresetData[pal.bouncePresetDropdown.selection.text]; } else { alert("Please select a preset before applying."); app.endUndoGroup(); return; }
                if (!presetProfile) { alert("Preset data could not be found."); app.endUndoGroup(); return; }
                var bounceExpression = core.generateBounceExpression(); var totalApplied = 0; 
                var separateDimWarningShown = false;
                var timeRemapWarningShown = false;
                var parentingChainWarningShown = false;

                var useParentRig = pal.nonDestructiveBounceCheckbox.value;

                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i]; if (layer.locked) continue;
                    
                    if (layer.timeRemapEnabled && !timeRemapWarningShown) {
                        alert("Workflow Alert: Layer '" + layer.name + "' has Time Remapping enabled.\n\nThis can provide inaccurate velocity data to the physics engine, resulting in weak or unexpected motion.\n\nFor best results, apply Momentum to layers *inside* this pre-comp, before Time Remapping.");
                        timeRemapWarningShown = true;
                        continue; 
                    }

                    if (!useParentRig) {
                        var hasKeysOnSelf = false;
                        var hasKeysOnParent = false;
                        var propsToCheck = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z"];
                        for (var p = 0; p < propsToCheck.length; p++) { try { if (layer.property("ADBE Transform Group").property(propsToCheck[p]).numKeys > 0) { hasKeysOnSelf = true; break; } } catch(e) {} }
                        if (layer.hasParent) { for (var p = 0; p < propsToCheck.length; p++) { try { if (layer.parent.property("ADBE Transform Group").property(propsToCheck[p]).numKeys > 0) { hasKeysOnParent = true; break; } } catch(e) {} } }
                        if (layer.hasParent && !hasKeysOnSelf && !hasKeysOnParent && !parentingChainWarningShown) {
                            alert("Pro Tip: No keyframes found on '" + layer.name + "' or its direct parent.\n\nFor complex rigs, Momentum delivers the best results when applied directly to the primary animated layer in the parent chain.");
                            parentingChainWarningShown = true;
                            continue; 
                        }
                    }

                    if (useParentRig) {
                        if (!layer.parent || layer.parent.name.indexOf(MotionEngine.config.controllerName) === -1) {
                            core.createParentRig(layer, layer.property("Position"), MotionEngine.config.controllerName, [0,0,0]);
                        }
                    }

                    core.installOrUpdateRig(layer, presetProfile, bounceConfig);
                    var appliedToProperty = false; 
                    
                    var propsToTry = [
                        { prop: layer.property("ADBE Transform Group").property("ADBE Position"), name: "Position" },
                        { prop: layer.property("ADBE Transform Group").property("ADBE Scale"), name: "Scale" },
                        { prop: layer.property("ADBE Transform Group").property("ADBE Rotate Z"), name: "Rotation" }
                    ];

                    for(var p = 0; p < propsToTry.length; p++){ 
                        try {
                            var prop = propsToTry[p].prop;
                            var propName = propsToTry[p].name;

                            if (prop && prop.canSetExpression && ( (useParentRig && propName === "Position") || prop.numKeys > 0) ) {
                                if (propName === "Position" && prop.dimensionsSeparated) {
                                    if (!separateDimWarningShown) {
                                        alert("Workflow Notice: 'Position' on layer '" + layer.name + "' has separated dimensions.\n\nMomentum's rig was not applied to this property because it requires a unified Position property. Please disable 'Separate Dimensions' before applying the rig if you want to affect Position.");
                                        separateDimWarningShown = true;
                                    }
                                    continue; 
                                }
                                prop.expression = bounceExpression; 
                                appliedToProperty = true;
                            }
                        } catch(e) {}
                    }
                    if (appliedToProperty) { totalApplied++; }
                }
                if (totalApplied > 0) {
                    ui.showStatus("Successfully applied Bounce rig to " + totalApplied + " layer(s).", "success");
                } else if (!timeRemapWarningShown && !parentingChainWarningShown) {
                    alert("Application Warning:\n\nRig controls were added, but no compatible properties with keyframes (Position, Scale, or Rotation) were found on the selected layer(s).\n\nMomentum's Bounce rig requires existing keyframes to generate physics.");
                    ui.showStatus("Warning: Rig added, but no keyframes found on selection.", "warning");
                }
                app.endUndoGroup();
            },

            applySnsRig: function() {
                var core = MotionEngine.core; var data = MotionEngine.data; var pal = MotionEngine.ui.pal; var ui = MotionEngine.ui; var snsConfig = MotionEngine.config.snsConfig;
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select at least one layer."); return; }
                
                var useParentRig = pal.nonDestructiveSnsCheckbox.value;
                var timeRemapWarningShown = false;

                if (!useParentRig) {
                    for(var i=0; i<layers.length; i++) {
                        if (layers[i].locked) continue;
                        try {
                            var scalePropCheck = layers[i].property("ADBE Transform Group").property("ADBE Scale");
                            if (scalePropCheck && scalePropCheck.numKeys > 0) {
                                if (!confirm("Warning: Layer '" + layers[i].name + "' has existing keyframes on its Scale property. Applying the S&S rig will override them. Do you want to continue?")) {
                                    ui.showStatus("S&S application cancelled by user.", "warning");
                                    return;
                                }
                                break;
                            }
                        } catch(e) {}
                    }
                }

                app.beginUndoGroup("Install/Update SnS Rig");
                var presetProfile; if (pal.snsUserPresetDropdown.selection !== null) { presetProfile = data.userPresets.sns[pal.snsUserPresetDropdown.selection.text]; } else if (pal.snsPresetDropdown.selection !== null) { presetProfile = data.snsPresetData[pal.snsPresetDropdown.selection.text]; } else { alert("Please select a preset before applying."); app.endUndoGroup(); return; }
                if (!presetProfile) { alert("Preset data could not be found."); app.endUndoGroup(); return; }
                
                var isInverted = pal.invertSnsCheckbox.value;
                var expressions = core.generateSnSExpressions(isInverted);
                var totalApplied = 0;

                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i]; if (layer.locked) continue;
                    
                    if (layer.timeRemapEnabled && !timeRemapWarningShown) {
                         alert("Workflow Alert: Layer '" + layer.name + "' has Time Remapping enabled.\n\nThis can provide inaccurate velocity data to the physics engine, resulting in weak or unexpected motion.\n\nFor best results, apply Momentum to layers *inside* this pre-comp, before Time Remapping.");
                        timeRemapWarningShown = true;
                        continue; 
                    }
                    
                    try {
                        var targetLayerForEffects = layer;
                        if (useParentRig) {
                           if (!layer.parent || layer.parent.name.indexOf(MotionEngine.config.controllerName) === -1) {
                                core.createParentRig(layer, layer.property("Position"), MotionEngine.config.controllerName, [0,0,0]);
                           }
                        }

                        core.installOrUpdateRig(targetLayerForEffects, presetProfile, snsConfig);
                        var scaleProp = targetLayerForEffects.property("ADBE Transform Group").property("ADBE Scale");
                        var rotProp = targetLayerForEffects.property("ADBE Transform Group").property("ADBE Rotate Z");
                        if (targetLayerForEffects.threeDLayer) { rotProp = targetLayerForEffects.property("ADBE Transform Group").property("ADBE Orientation"); }
                        if (scaleProp && scaleProp.canSetExpression) scaleProp.expression = expressions.scale;
                        if (rotProp && rotProp.canSetExpression) rotProp.expression = expressions.rotation;
                        totalApplied++;
                    } catch (e) {
                        alert("Could not apply SnS rig to layer '" + layer.name + "'.");
                    }
                }
                if(totalApplied > 0){
                    ui.showStatus("Successfully applied S&S rig to " + totalApplied + " layer(s).", "success");
                }
                app.endUndoGroup();
            },
            
            applyWiggleRig: function() {
                var core = MotionEngine.core; var data = MotionEngine.data; var pal = MotionEngine.ui.pal; var ui = MotionEngine.ui; var wiggleConfig = MotionEngine.config.wiggleConfig;
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select at least one layer."); return; }
                var selectedProps = comp.selectedProperties;
                var applyToSelectedProps = selectedProps.length > 0;
                
                app.beginUndoGroup("Apply Dynamic Wiggle Rig");
                var presetProfile; if (pal.wiggleUserPresetDropdown.selection !== null) { presetProfile = data.userPresets.wiggle[pal.wiggleUserPresetDropdown.selection.text]; } else if (pal.wigglePresetDropdown.selection !== null) { presetProfile = data.wigglePresetData[pal.wigglePresetDropdown.selection.text]; } else { alert("Please select a preset before applying."); app.endUndoGroup(); return; }
                if (!presetProfile) { alert("Preset data could not be found."); app.endUndoGroup(); return; }
                
                presetProfile.loop = pal.loopWiggleCheckbox.value ? 1 : 0;
                presetProfile.loopTime = parseFloat(pal.loopWiggleDuration.text);

                var wiggleExpression = core.generateWiggleExpression();
                var useParentRig = pal.additiveWiggleCheckbox.value;
                var totalApplied = 0;

                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i]; if (layer.locked) continue;
                    try {
                        var targetLayer = layer;
                        var propsToWiggle = [];

                        if (useParentRig) {
                            var propToParent = null;
                            if (applyToSelectedProps) {
                                for (var j = 0; j < selectedProps.length; j++) {
                                    if (selectedProps[j].propertyGroup(selectedProps[j].propertyDepth) === layer && selectedProps[j].canSetExpression) {
                                        propToParent = selectedProps[j];
                                        break; 
                                    }
                                }
                            } else {
                                propToParent = layer.property("ADBE Transform Group").property("ADBE Position");
                            }

                            if (!propToParent) continue;
                            
                            var resetValue;
                            switch(propToParent.matchName) {
                                case "ADBE Position": case "ADBE Position_0": case "ADBE Position_1": case "ADBE Position_2":
                                case "ADBE Orientation":
                                    resetValue = [0,0,0]; break;
                                case "ADBE Scale":
                                    resetValue = [100,100,100]; break;
                                default:
                                    resetValue = 0; break;
                            }
                            targetLayer = core.createParentRig(layer, propToParent, "[Wiggle Ctrl] ", resetValue);
                            var targetProp = targetLayer.property(propToParent.matchName);
                            if (targetProp) propsToWiggle.push(targetProp);
                            
                        } else {
                            targetLayer = layer;
                            if (applyToSelectedProps) {
                                for (var j = 0; j < selectedProps.length; j++) {
                                    if (selectedProps[j].propertyGroup(selectedProps[j].propertyDepth) === layer && selectedProps[j].canSetExpression) {
                                        propsToWiggle.push(selectedProps[j]);
                                    }
                                }
                            } else {
                                var posProp = layer.property("ADBE Transform Group").property("ADBE Position");
                                var rotProp = layer.property("ADBE Transform Group").property("ADBE Rotate Z");
                                if (posProp) propsToWiggle.push(posProp);
                                if (rotProp) propsToWiggle.push(rotProp);
                            }
                            
                            var hasKeys = false;
                            for(var p=0; p < propsToWiggle.length; p++){
                                if(propsToWiggle[p] && propsToWiggle[p].numKeys > 0) {
                                    hasKeys = true;
                                    break;
                                }
                            }
                            
                            if (hasKeys && !useParentRig) {
                                if (!confirm("Warning: Applying Wiggle directly will override existing keyframes on '" + layer.name + "'.\n\nEnable 'Don't Overwrite Keyframes' to apply it on top of existing animation.")) {
                                    continue;
                                }
                            }
                        }

                        if (propsToWiggle.length > 0) {
                            core.installOrUpdateRig(targetLayer, presetProfile, wiggleConfig);
                            for(var p=0; p<propsToWiggle.length; p++){
                                if(propsToWiggle[p]) propsToWiggle[p].expression = wiggleExpression;
                            }
                            totalApplied++;
                        }
                    } catch(e) {
                         alert("Could not apply Wiggle rig to layer '" + layer.name + "'.");
                    }
                }

                if(totalApplied > 0){
                    ui.showStatus("Successfully applied Wiggle rig to " + totalApplied + " layer(s).", "success");
                } else {
                    ui.showStatus("Wiggle not applied. No valid layers or properties were targeted.", "warning");
                }
                app.endUndoGroup();
            },

            removeBounceRig: function() {
                var core = MotionEngine.core; var ui = MotionEngine.ui; var bounceConfig = MotionEngine.config.bounceConfig;
                var comp = app.project.activeItem;
                var selectedLayers = comp.selectedLayers; if (selectedLayers.length === 0) { alert("Please select layer(s) with a Bounce rig to remove."); return; }
                app.beginUndoGroup("Remove Bounce Rig");
                var wasParented = false;
                for (var i = 0; i < selectedLayers.length; i++) { 
                    if (selectedLayers[i].locked) continue; 
                    if (selectedLayers[i].parent && selectedLayers[i].parent.name.indexOf(MotionEngine.config.controllerName) > -1) { wasParented = true; }
                    core.removeRig(selectedLayers[i], bounceConfig); 
                }
                ui.showStatus("Removed Bounce rig from " + selectedLayers.length + " layer(s).", "success");
                if (wasParented) alert("Bounce rig effects and expressions have been removed. Note: The layer is still parented to its [Momentum Ctrl] null, which contains the original animation.");
                app.endUndoGroup();
            },
            removeSnsRig: function() {
                var core = MotionEngine.core; var ui = MotionEngine.ui; var snsConfig = MotionEngine.config.snsConfig;
                var comp = app.project.activeItem;
                var selectedLayers = comp.selectedLayers; if (selectedLayers.length === 0) { alert("Please select layer(s) with an SnS rig to remove."); return; }
                app.beginUndoGroup("Remove SnS Rig");
                var wasParented = false;
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i]; if (layer.locked) continue;
                    if (layer.parent && layer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) {
                        wasParented = true;
                    }
                    core.removeRig(layer, snsConfig);
                }
                ui.showStatus("Removed S&S rig from " + selectedLayers.length + " layer(s).", "success");
                if (wasParented) alert("S&S rig effects and expressions have been removed. Note: The layer is still parented to its [Momentum Ctrl] null, which contains the original animation.");
                app.endUndoGroup();
            },
            removeWiggleRig: function() {
                var core = MotionEngine.core; var ui = MotionEngine.ui; var wiggleConfig = MotionEngine.config.wiggleConfig;
                var comp = app.project.activeItem;
                var selectedLayers = comp.selectedLayers; if (selectedLayers.length === 0) { alert("Please select layer(s) with a Wiggle rig to remove."); return; }
                app.beginUndoGroup("Remove Wiggle Rig");
                var wasParented = false;
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i]; if (layer.locked) continue; var targetLayer = layer;
                    if (layer.parent && layer.parent.name.indexOf("[Wiggle Ctrl] ") === 0) {
                        targetLayer = layer.parent;
                        wasParented = true;
                    }
                    core.removeRig(targetLayer, wiggleConfig);
                }
                ui.showStatus("Removed Wiggle rig from " + selectedLayers.length + " layer(s).", "success");
                if (wasParented) alert("Rig effects and expressions have been removed. Note: Layers are still parented to their [Ctrl] nulls, which contain the original keyframe animation.");
                app.endUndoGroup();
            },
            
            createActivationMarkers: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui;
                var comp = app.project.activeItem;
                app.beginUndoGroup("Create Rig Activation Markers");
                var markerProp = comp.markerProperty;
                var startTime = comp.time;
                var endTime = startTime + 1;
                markerProp.setValueAtTime(startTime, new MarkerValue("Rig_Start"));
                markerProp.setValueAtTime(endTime, new MarkerValue("Rig_End"));
                app.endUndoGroup();
                ui.showStatus("Activation markers created at playhead.", "success");
            },
            
            linkRigToMarkers: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui; var comp = app.project.activeItem;
                var layers = comp.selectedLayers;
                if (layers.length === 0) { alert("Please select one or more layers with a Wiggle rig."); return; }

                var markerProp = comp.markerProperty;
                var startMarkerExists = false; try { if(markerProp.key("Rig_Start")) startMarkerExists = true; } catch(e){}
                var endMarkerExists = false; try { if(markerProp.key("Rig_End")) endMarkerExists = true; } catch(e){}

                if (!startMarkerExists && !endMarkerExists) {
                    if (confirm("No 'Rig_Start' or 'Rig_End' markers found in this comp. Create them now at the playhead?")) {
                        this.createActivationMarkers();
                    } else {
                        ui.showStatus("Link cancelled. No activation markers found.", "warning");
                        return;
                    }
                }

                app.beginUndoGroup("Link Wiggle Rig to Markers");
                var expressionString = [
                    "// Linked to comp markers by Momentum v" + MotionEngine.config.version,
                    "var m = thisComp.marker;",
                    "var startTime = 0;",
                    "var endTime = thisComp.duration;",
                    "try{ startTime = m.key('Rig_Start').time; } catch(e){}",
                    "try{ endTime = m.key('Rig_End').time; } catch(e){}",
                    "if (time >= startTime && time < endTime) { 1; } else { 0; }"
                ].join("\n");

                var linkedLayersCount = 0;
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (layer.locked) continue;
                    try {
                        var enableProp = layer.Effects.property(MotionEngine.config.wiggleConfig.rigPrefix + "Enable").property("Checkbox");
                        if(enableProp) {
                            enableProp.expression = expressionString;
                            linkedLayersCount++;
                        }
                    } catch(e) {}
                }
                app.endUndoGroup();

                if (linkedLayersCount > 0) { ui.showStatus("Linked " + linkedLayersCount + " Wiggle rig(s) to comp markers.", "success");
                } else { alert("No Momentum Wiggle rigs found on the selected layers."); ui.showStatus("Could not find any Wiggle rigs to link.", "warning"); }
            },
            
            unlinkRigFromMarkers: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui;
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select one or more layers with a linked Wiggle rig."); return; }

                app.beginUndoGroup("Unlink Wiggle Rig from Markers");
                var unlinkedLayersCount = 0;
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (layer.locked) continue;
                    var markerComment = "// Linked to comp markers by Momentum";
                     try {
                        var enableProp = layer.Effects.property(MotionEngine.config.wiggleConfig.rigPrefix + "Enable").property("Checkbox");
                        if(enableProp && enableProp.expression.indexOf(markerComment) > -1) {
                            enableProp.expression = "";
                            enableProp.setValue(1);
                            unlinkedLayersCount++;
                        }
                    } catch(e) {}
                }
                app.endUndoGroup();

                 if (unlinkedLayersCount > 0) { ui.showStatus("Unlinked " + unlinkedLayersCount + " Wiggle rig(s) from markers.", "success");
                } else { ui.showStatus("No marker-linked Wiggle rigs found on selection.", "warning"); }
            },
            isolateSelectedAxes: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui; var comp = app.project.activeItem;
                var selProps = comp.selectedProperties;
                if (selProps.length !== 1) { alert("Please select exactly one multi-dimensional property (e.g., Position, Scale)."); return; }

                var prop = selProps[0];
                try {
                    var propValType = prop.propertyValueType;
                    if (propValType !== PropertyValueType.TwoD_SPATIAL && propValType !== PropertyValueType.TwoD && propValType !== PropertyValueType.ThreeD_SPATIAL && propValType !== PropertyValueType.ThreeD) {
                        alert("The selected property ('" + prop.name + "') is not a multi-dimensional property."); return;
                    }
                    var layer = prop.propertyGroup(prop.propertyDepth);
                    if (layer.locked) { alert("Cannot isolate axes on a locked layer."); return; }
                    if (layer.Effects.property("AXIS | " + prop.name + " | X")) { alert("This property's axes are already isolated."); return; }

                    app.beginUndoGroup("Isolate Property Axes");
                    var dims = (propValType === PropertyValueType.TwoD_SPATIAL || propValType === PropertyValueType.TwoD) ? 2 : 3;
                    var axes = ["X", "Y", "Z"];
                    var sliders = [];
                    var effectNames = [];

                    for (var i = 0; i < dims; i++) {
                        var effectName = "AXIS | " + prop.name + " | " + axes[i];
                        effectNames.push('"' + effectName + '"');
                        var slider = layer.Effects.addProperty("Slider Control");
                        slider.name = effectName;
                        sliders.push(slider.property("Slider"));
                    }

                    if (prop.numKeys > 0) {
                        for (var k = 1; k <= prop.numKeys; k++) {
                            var keyTime = prop.keyTime(k);
                            var keyVal = prop.keyValue(k);
                            for (var d = 0; d < dims; d++) {
                                sliders[d].setValueAtTime(keyTime, keyVal[d]);
                                try {
                                    sliders[d].setInterpolationTypeAtKey(sliders[d].numKeys, prop.keyInInterpolationType(k), prop.keyOutInterpolationType(k));
                                    sliders[d].setTemporalEaseAtKey(sliders[d].numKeys, prop.keyInTemporalEase(k), prop.keyOutTemporalEase(k));
                                } catch (e) {}
                            }
                        }
                        while (prop.numKeys > 0) { prop.removeKey(1); }
                    } else {
                        var staticVal = prop.value;
                         for (var d = 0; d < dims; d++) {
                            sliders[d].setValue(staticVal[d]);
                        }
                    }

                    var recombineExp = "var sliders = [" + effectNames.join(",") + "];\n";
                    recombineExp += "var val = [];\n";
                    recombineExp += "for(var i = 0; i < sliders.length; i++){ val.push(effect(sliders[i])('Slider')); }\n";
                    recombineExp += "val;";
                    prop.expression = recombineExp;
                    prop.selected = false;
                    for (var s = 0; s < sliders.length; s++) { sliders[s].selected = true; }

                    app.endUndoGroup();
                    ui.showStatus("Axes isolated. Apply rigs to the new slider controls.", "success");
                } catch(e) {
                    alert("Could not isolate axes. Please ensure a valid property is selected on an unlocked layer.");
                }
            },
            removeAxisIsolation: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui; var comp = app.project.activeItem;
                var selLayers = comp.selectedLayers;
                if (selLayers.length !== 1) { alert("Please select the single layer with isolated axes to remove."); return; }
                
                var layer = selLayers[0];
                if (layer.locked) { alert("Cannot remove isolation from a locked layer."); return; }

                var isolatedProps = [];
                var slidersToRemove = [];
                
                for (var i = 1; i <= layer.Effects.numProperties; i++) {
                    var effect = layer.Effects.property(i);
                    if (effect.name.indexOf("AXIS | ") === 0) {
                        var parts = effect.name.split(" | ");
                        var propName = parts[1];
                        if (isolatedProps.indexOf(propName) === -1) { isolatedProps.push(propName); }
                        slidersToRemove.push(effect);
                    }
                }

                if (isolatedProps.length === 0) { alert("No isolated axes found on the selected layer."); return; }

                if (!confirm("This will bake the slider animation back to the original property and delete the AXIS slider controls. Are you sure you want to continue?")) {
                    return;
                }

                app.beginUndoGroup("Remove Axis Isolation");

                for (var p = 0; p < isolatedProps.length; p++) {
                    try {
                        var propName = isolatedProps[p];
                        var prop = layer.property("Transform").property(propName);
                        if (!prop) continue;

                        var xSlider = layer.Effects.property("AXIS | " + propName + " | X").property("Slider");
                        var ySlider = layer.Effects.property("AXIS | " + propName + " | Y").property("Slider");
                        var zSlider = layer.Effects.property("AXIS | " + propName + " | Z") ? layer.Effects.property("AXIS | " + propName + " | Z").property("Slider") : null;
                        
                        prop.expression = "";

                        if (xSlider.numKeys > 0) {
                            for (var k = 1; k <= xSlider.numKeys; k++) {
                                var keyTime = xSlider.keyTime(k);
                                var newKeyVal = [];
                                newKeyVal.push(xSlider.keyValue(k));
                                newKeyVal.push(ySlider.keyValue(k));
                                if (zSlider) newKeyVal.push(zSlider.keyValue(k));

                                prop.setValueAtTime(keyTime, newKeyVal);
                                 try {
                                    prop.setInterpolationTypeAtKey(prop.numKeys, xSlider.keyInInterpolationType(k), xSlider.keyOutInterpolationType(k));
                                    prop.setTemporalEaseAtKey(prop.numKeys, xSlider.keyInTemporalEase(k), xSlider.keyOutTemporalEase(k));
                                } catch (e) {}
                            }
                        } else {
                             var staticVal = [];
                             staticVal.push(xSlider.value);
                             staticVal.push(ySlider.value);
                             if (zSlider) staticVal.push(zSlider.value);
                             prop.setValue(staticVal);
                        }
                    } catch(e) {}
                }
                
                for (var i = slidersToRemove.length - 1; i >= 0; i--) {
                    try {
                        slidersToRemove[i].remove();
                    } catch(e) {}
                }

                app.endUndoGroup();
                ui.showStatus("Axis isolation removed successfully.", "success");
            },

            bakeUnifiedRigs: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var core = MotionEngine.core; var ui = MotionEngine.ui; var pal = MotionEngine.ui.pal;
                var bounceConfig = MotionEngine.config.bounceConfig; var snsConfig = MotionEngine.config.snsConfig; var wiggleConfig = MotionEngine.config.wiggleConfig;
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select one or more layers with Momentum rigs to bake."); return; }
                
                var holdRateValue = 1;
                if(pal.holdCheckbox.value) {
                    holdRateValue = parseInt(pal.holdRateDropdown.selection.text);
                }
                var bakeOptions = { 
                    duplicate: pal.duplicateCheckbox.value, 
                    samplingRate: parseFloat(pal.samplingDropdown.selection.text), 
                    useHold: pal.holdCheckbox.value, 
                    simplify: pal.simplifyKeysCheckbox.value,
                    holdRate: holdRateValue
                };
                
                if (!bakeOptions.duplicate) {
                    if (!confirm("This will bake keyframes directly onto the original layer(s) and remove the rig(s). This action cannot be undone easily. Are you sure you want to proceed?")) {
                        return;
                    }
                }

                var progressPal = new Window("palette", "Baking Progress...");
                progressPal.add("statictext", [15, 15, 300, 35], "Initializing Bake...");
                progressPal.show();

                app.beginUndoGroup("Bake Momentum Rigs");
                var bakedCount = 0; var newLayers = [];
                try {
                    for (var i = 0; i < layers.length; i++) {
                        try {
                           progressPal.children[0].text = "Processing Layer " + (i + 1) + " of " + layers.length + ": '" + layers[i].name + "'";
                           progressPal.update();
                        } catch(e) {}
                        
                        var layer = layers[i]; if (layer.locked) continue;

                        var propertiesToBake = [];
                        var expressionMap = {};
                        var rigConfigs = [];

                        try {
                            var targetLayerSns = layer;
                            if (layer.parent && layer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) { targetLayerSns = layer; }
                            if (targetLayerSns.Effects.property(snsConfig.rigPrefix + snsConfig.masterControl.name)) {
                                var snsExpressions = core.generateSnSExpressions(false); 
                                propertiesToBake.push("ADBE Scale", "ADBE Rotate Z", "ADBE Orientation");
                                expressionMap["ADBE Scale"] = snsExpressions.scale;
                                expressionMap["ADBE Rotate Z"] = snsExpressions.rotation;
                                expressionMap["ADBE Orientation"] = snsExpressions.rotation;
                                rigConfigs.push(snsConfig);
                            }
                        } catch(e) {}

                        try {
                            if (layer.Effects.property(bounceConfig.rigPrefix + bounceConfig.masterControl.name)) {
                                var bounceExpression = core.generateBounceExpression();
                                var bounceProps = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z"];
                                var foundBounce = false;
                                for (var p = 0; p < bounceProps.length; p++) {
                                    var prop = layer.property("ADBE Transform Group").property(bounceProps[p]);
                                    if (prop && prop.expression.indexOf(bounceConfig.scriptName) > -1) {
                                        propertiesToBake.push(bounceProps[p]);
                                        expressionMap[bounceProps[p]] = bounceExpression;
                                        foundBounce = true;
                                    }
                                }
                                if(foundBounce) rigConfigs.push(bounceConfig);
                            }
                        } catch(e) {}

                        try {
                            var targetLayerWiggle = layer;
                            if (layer.parent && layer.parent.name.indexOf("[Wiggle Ctrl] ") === 0) { targetLayerWiggle = layer.parent; }
                            if (targetLayerWiggle.Effects.property(wiggleConfig.rigPrefix + wiggleConfig.masterControl.name)) {
                                 var wiggleExpression = core.generateWiggleExpression();
                                 var wiggleProps = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z", "ADBE Orientation", "ADBE Opacity"];
                                 var foundWiggle = false;
                                 for (var p = 0; p < wiggleProps.length; p++) {
                                    var prop = targetLayerWiggle.property("ADBE Transform Group").property(wiggleProps[p]);
                                    if (prop && prop.expression.indexOf(wiggleConfig.scriptName) > -1) {
                                        propertiesToBake.push(wiggleProps[p]);
                                        expressionMap[wiggleProps[p]] = wiggleExpression;
                                        foundWiggle = true;
                                    }
                                 }
                                 if (foundWiggle) rigConfigs.push(wiggleConfig);
                            }
                        } catch(e) {}
                        
                        if (rigConfigs.length > 0) {
                            var uniqueProps = [];
                            for(var u=0; u<propertiesToBake.length; u++) {
                                if(uniqueProps.indexOf(propertiesToBake[u]) === -1) uniqueProps.push(propertiesToBake[u]);
                            }

                            var propsToActuallyBake = [];
                            var selProps = comp.selectedProperties;
                            if (selProps.length > 0) {
                                var selPropNames = [];
                                for (var s=0; s<selProps.length; s++) {
                                    if(selProps[s].propertyGroup(selProps[s].propertyDepth) === layer) {
                                        selPropNames.push(selProps[s].matchName);
                                    }
                                }
                                for (var p=0; p<uniqueProps.length; p++) {
                                    for(var sp=0; sp<selPropNames.length; sp++) {
                                        if (uniqueProps[p] === selPropNames[sp]) {
                                            propsToActuallyBake.push(uniqueProps[p]);
                                            break;
                                        }
                                    }
                                }
                                if(propsToActuallyBake.length === 0) {
                                    alert("Smart Bake Warning:\n\nYou had properties selected, but none of them have Momentum rigs applied. Nothing will be baked for layer '" + layer.name + "'.\n\nDeselect all properties to bake all rigs on the layer.");
                                    continue;
                                }
                            } else {
                                propsToActuallyBake = uniqueProps;
                            }
                            
                            var newLayer = core.bakeRig(layer, rigConfigs, expressionMap, propsToActuallyBake, bakeOptions);
                            if (newLayer) newLayers.push(newLayer);
                            bakedCount++;
                        }
                    }
                } finally {
                    progressPal.close();
                }

                if (bakeOptions.duplicate) {
                    for (var l = 0; l < layers.length; l++) { layers[l].selected = false; }
                    for (var nl = 0; nl < newLayers.length; nl++) { newLayers[nl].selected = true; }
                }
                app.endUndoGroup();
                if (bakedCount > 0) { ui.showStatus("Bake complete for " + bakedCount + " layer(s)!", "success"); }
                else { alert("Bake Failed: No valid Momentum rigs found on the selected layers.\n\nA rig is valid if it has its effect controls and a corresponding expression applied to a property."); ui.showStatus("No valid rigs found on selection to bake.", "warning"); }
            },

            saveUserPreset: function(type) {
                if (!MotionEngine.core.isValidContext()) return;
                var core = MotionEngine.core; var ui = MotionEngine.ui;
                var config, presetDb;
                if (type === 'bounce') { config = MotionEngine.config.bounceConfig; presetDb = MotionEngine.data.userPresets.bounce; } 
                else if (type === 'sns') { config = MotionEngine.config.snsConfig; presetDb = MotionEngine.data.userPresets.sns; } 
                else if (type === 'wiggle') { config = MotionEngine.config.wiggleConfig; presetDb = MotionEngine.data.userPresets.wiggle; } 
                else { return; }
                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select a layer with the appropriate rig to save its settings."); return; }
                var targetLayer = layers[0]; 
                if (targetLayer.parent && targetLayer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) { targetLayer = layers[0]; }
                if (type === 'wiggle' && targetLayer.parent && targetLayer.parent.name.indexOf("[Wiggle Ctrl] ") === 0) { targetLayer = targetLayer.parent; }
                if (!targetLayer.Effects.property(config.rigPrefix + config.masterControl.name)) { alert("The selected layer does not have a '" + config.scriptName + "' rig installed."); return; }
                
                var presetName = prompt("Enter a name for your preset:", "My Custom Preset"); if (!presetName || presetName.trim() === "") { return; }

                if (presetDb[presetName] && !confirm("Preset '" + presetName + "' already exists. Overwrite it?")) { return; }
                var newPreset = {};
                try {
                    for (var i = 0; i < config.rigControls.length; i++) { 
                        var control = config.rigControls[i]; 
                        var effect = targetLayer.Effects.property(config.rigPrefix + control.name); 
                        var prop = (control.presetKey === 'loop') ? effect.property("Checkbox") : effect.property("Slider");
                        newPreset[control.presetKey] = prop.value; 
                    }
                    presetDb[presetName] = newPreset;
                    core.saveUserPresets();
                    ui.updateUserPresetDropdowns();
                    ui.showStatus("Preset '" + presetName + "' saved successfully.", "success");
                } catch (e) { alert("Could not read rig values. Error: " + e.toString()); }
            },
            deleteUserPreset: function(type) {
                if (!MotionEngine.core.isValidContext()) return;
                var core = MotionEngine.core; var ui = MotionEngine.ui;
                var presetDb, dropdown;
                if (type === 'bounce') { presetDb = MotionEngine.data.userPresets.bounce; dropdown = MotionEngine.ui.pal.bounceUserPresetDropdown; } 
                else if (type === 'sns') { presetDb = MotionEngine.data.userPresets.sns; dropdown = MotionEngine.ui.pal.snsUserPresetDropdown; } 
                else if (type === 'wiggle') { presetDb = MotionEngine.data.userPresets.wiggle; dropdown = MotionEngine.ui.pal.wiggleUserPresetDropdown; } 
                else { return; }
                if (dropdown.selection === null) { alert("Please select a user preset to delete."); return; }
                var presetName = dropdown.selection.text;
                if (confirm("Are you sure you want to delete the user preset '" + presetName + "'? This cannot be undone.")) {
                    delete presetDb[presetName];
                    core.saveUserPresets();
                    ui.updateUserPresetDropdowns();
                    ui.showStatus("Preset '" + presetName + "' deleted.", "success");
                }
            },
            
            copyPhysics: function(type) {
                if (!MotionEngine.core.isValidContext()) return;
                var core = MotionEngine.core; var ui = MotionEngine.ui;
                var config, rigName;
                if (type === 'bounce') { config = MotionEngine.config.bounceConfig; rigName = "Bounce"; } 
                else if (type === 'sns') { config = MotionEngine.config.snsConfig; rigName = "SnS"; } 
                else if (type === 'wiggle') { config = MotionEngine.config.wiggleConfig; rigName = "Wiggle"; } 
                else { return; }

                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select a layer with a " + rigName + " rig to copy from."); return; }
                var targetLayer = layers[0]; 
                if (targetLayer.parent && targetLayer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) { targetLayer = layers[0]; }
                if (type === 'wiggle' && targetLayer.parent && targetLayer.parent.name.indexOf("[Wiggle Ctrl] ") === 0) { targetLayer = targetLayer.parent; }
                
                if (!targetLayer.Effects.property(config.rigPrefix + config.masterControl.name)) { alert("The selected layer does not have a '" + rigName + "' rig installed."); return; }
                
                MotionEngine.data.clipboard.type = type;
                MotionEngine.data.clipboard.values = {};
                try {
                    for (var i = 0; i < config.rigControls.length; i++) { 
                        var control = config.rigControls[i];
                        var effect = targetLayer.Effects.property(config.rigPrefix + control.name);
                        var prop = (control.presetKey === 'loop') ? effect.property("Checkbox") : effect.property("Slider");
                        MotionEngine.data.clipboard.values[control.presetKey] = prop.value;
                    }
                    ui.showStatus(rigName + " settings copied.", "success");
                } catch (e) { alert("Could not read rig values. Error: " + e.toString()); }
            },

            pastePhysics: function(type) {
                if (!MotionEngine.core.isValidContext()) return;
                var core = MotionEngine.core; var ui = MotionEngine.ui;
                var config, rigName;
                if (type === 'bounce') { config = MotionEngine.config.bounceConfig; rigName = "Bounce"; } 
                else if (type === 'sns') { config = MotionEngine.config.snsConfig; rigName = "SnS"; } 
                else if (type === 'wiggle') { config = MotionEngine.config.wiggleConfig; rigName = "Wiggle"; } 
                else { return; }
                
                if (MotionEngine.data.clipboard.type !== type) {
                    alert("The copied settings are not for a " + rigName + " rig.");
                    return;
                }

                var comp = app.project.activeItem;
                var layers = comp.selectedLayers; if (layers.length === 0) { alert("Please select one or more layers to paste " + rigName + " settings to."); return; }

                app.beginUndoGroup("Paste " + rigName + " Settings");
                var pastedCount = 0;
                for (var i = 0; i < layers.length; i++) {
                    var targetLayer = layers[i];
                    if (targetLayer.locked) continue;
                    
                    if (!targetLayer.Effects.property(config.rigPrefix + config.masterControl.name)) {
                        if(type==='bounce') this.applyBounceRig();
                        else if(type==='sns') this.applySnsRig();
                        else if(type==='wiggle') this.applyWiggleRig();
                    }

                    if (targetLayer.parent && targetLayer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) { targetLayer = layers[0]; }
                    if (type === 'wiggle' && targetLayer.parent && targetLayer.parent.name.indexOf("[Wiggle Ctrl] ") === 0) { targetLayer = targetLayer.parent; }

                    if (targetLayer.Effects.property(config.rigPrefix + config.masterControl.name)) {
                        try {
                             for (var presetKey in MotionEngine.data.clipboard.values) {
                                for(var c=0; c < config.rigControls.length; c++) {
                                    if(config.rigControls[c].presetKey === presetKey) {
                                        var controlName = config.rigControls[c].name;
                                        var prop = (presetKey === 'loop') ? targetLayer.Effects.property(config.rigPrefix + controlName).property("Checkbox") : targetLayer.Effects.property(config.rigPrefix + controlName).property("Slider");
                                        prop.setValue(MotionEngine.data.clipboard.values[presetKey]);
                                        break;
                                    }
                                }
                            }
                            pastedCount++;
                        } catch (e) {}
                    }
                }
                app.endUndoGroup();
                if (pastedCount > 0) {
                    ui.showStatus("Pasted settings to " + pastedCount + " layer(s).", "success");
                } else {
                    alert("Could not paste settings. Please try again.");
                }
            },
            
            toggleGlobalBypass: function(shouldBypass) {
                if (!MotionEngine.core.isValidContext()) return;
                var comp = app.project.activeItem;
                
                var rigConfigs = [MotionEngine.config.bounceConfig, MotionEngine.config.snsConfig, MotionEngine.config.wiggleConfig];
                
                app.beginUndoGroup("Toggle Momentum Rigs Bypass");

                if (shouldBypass) {
                    MotionEngine.data.bypassStates = [];
                    for (var i = 1; i <= comp.numLayers; i++) {
                        var layer = comp.layer(i);
                        if (layer.locked) continue;
                        for(var c=0; c < rigConfigs.length; c++) {
                            var config = rigConfigs[c];
                            try {
                                var enableProp = layer.Effects.property(config.rigPrefix + config.masterControl.name).property("Checkbox");
                                if (enableProp) {
                                    MotionEngine.data.bypassStates.push({
                                        layerIndex: layer.index,
                                        rigPrefix: config.rigPrefix,
                                        expression: enableProp.expression,
                                        value: enableProp.value
                                    });
                                    enableProp.expression = "0;";
                                }
                            } catch(e) {}
                        }
                    }
                    if (MotionEngine.data.bypassStates.length > 0) MotionEngine.ui.showStatus("Bypass enabled.", "success");
                } else {
                    for (var s = 0; s < MotionEngine.data.bypassStates.length; s++) {
                        var state = MotionEngine.data.bypassStates[s];
                        try {
                            var layer = comp.layer(state.layerIndex);
                             if (layer.locked) continue;
                            var enableProp = layer.Effects.property(state.rigPrefix + "Enable").property("Checkbox");
                            enableProp.expression = state.expression;
                            if (state.expression === "") {
                                enableProp.setValue(state.value);
                            }
                        } catch(e) {}
                    }
                    if (MotionEngine.data.bypassStates.length > 0) MotionEngine.ui.showStatus("Bypass disabled.", "success");
                    MotionEngine.data.bypassStates = [];
                }
                app.endUndoGroup();
            },
            
            soloRig: function() {
                if (!MotionEngine.core.isValidContext()) return;
                var ui = MotionEngine.ui;
                var comp = app.project.activeItem;
                var selLayers = comp.selectedLayers;
                if (selLayers.length !== 1) {
                    alert("Please select exactly one layer to solo its Momentum rigs.");
                    return;
                }
                var soloLayer = selLayers[0];

                app.beginUndoGroup("Solo Momentum Rigs");
                this.toggleGlobalBypass(true);
                
                var restoredCount = 0;
                 for (var s = 0; s < MotionEngine.data.bypassStates.length; s++) {
                    var state = MotionEngine.data.bypassStates[s];
                    if(state.layerIndex === soloLayer.index) {
                         try {
                            var enableProp = soloLayer.Effects.property(state.rigPrefix + "Enable").property("Checkbox");
                            enableProp.expression = state.expression;
                            if (state.expression === "") {
                                enableProp.setValue(state.value);
                            }
                            restoredCount++;
                        } catch(e) {}
                    }
                }
                app.endUndoGroup();

                if (restoredCount > 0) {
                    MotionEngine.data.isSoloed = true;
                    ui.showStatus("Solo mode enabled for '" + soloLayer.name + "'.", "success");
                    ui.pal.soloBtn.enabled = false;
                    ui.pal.unSoloBtn.enabled = true;
                    ui.pal.bypassCheckbox.value = true;
                } else {
                    this.unSoloRig();
                    alert("No Momentum rigs found on the selected layer to solo.");
                }
            },
            
            unSoloRig: function() {
                var ui = MotionEngine.ui;
                this.toggleGlobalBypass(false);
                MotionEngine.data.isSoloed = false;
                ui.pal.soloBtn.enabled = true;
                ui.pal.unSoloBtn.enabled = false;
                ui.pal.bypassCheckbox.value = false;
            }
        },
        ui: {
            pal: null,
            build: function() {
                this.pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", MotionEngine.config.scriptName + " " + MotionEngine.config.version, undefined, { resizeable: true });
                if (!this.pal) return; var pal = this.pal;
                pal.orientation = "column"; pal.alignChildren = ["fill", "top"]; pal.spacing = 5; pal.margins = [10,15,10,10];
    
                var titleGroup = pal.add("group");
                titleGroup.orientation = "row";
                titleGroup.alignChildren = ["left", "center"];
                var title = titleGroup.add("statictext", undefined, MotionEngine.config.scriptName);
                title.graphics.font = ScriptUI.newFont("Arial", "BOLD", 22);
                title.graphics.foregroundColor = title.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.9, 0.9, 0.95], 1);
                var versionText = titleGroup.add("statictext", undefined, "v" + MotionEngine.config.version + " by RANA");
                versionText.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 10);
                versionText.graphics.foregroundColor = versionText.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.6, 0.6, 0.6], 1);
                var helpBtn = titleGroup.add("button", undefined, "?");
                helpBtn.alignment = ["right", "center"];
                helpBtn.preferredSize.width = 25;
                helpBtn.helpTip = "About & Best Practices";
                helpBtn.onClick = this.showHelpDialog;

                var sloganGroup = pal.add("group");
                sloganGroup.orientation = "row";
                sloganGroup.alignment = 'center';
                sloganGroup.spacing = 0;
                sloganGroup.margins = [0, -2, 0, 5];
                var sloganText = sloganGroup.add("statictext", undefined, "Your Intelligent Secondary Motion Toolkit");
                sloganText.alignment = 'fill';
                sloganText.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 11);
                sloganText.graphics.foregroundColor = sloganText.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.8, 0.8, 0.8], 1);
                
                var quickApplyPanel = pal.add("panel", undefined, "Quick Apply");
                quickApplyPanel.orientation = "row";
                quickApplyPanel.alignment = "fill";
                quickApplyPanel.margins = 10;
                var quickBounceBtn = quickApplyPanel.add("button", undefined, "Bounce");
                quickBounceBtn.helpTip = "Applies the 'Very Subtle' Bounce preset.";
                var quickSnsBtn = quickApplyPanel.add("button", undefined, "Squash & Stretch");
                quickSnsBtn.helpTip = "Applies the 'Very Subtle' S&S preset.";
                var quickWiggleBtn = quickApplyPanel.add("button", undefined, "Wiggle");
                quickWiggleBtn.helpTip = "Applies the 'Very Subtle' Wiggle preset.";
                
                var enginePanel = pal.add("panel", undefined, "1. Apply Physics");
                enginePanel.graphics.foregroundColor = enginePanel.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.4, 0.8, 0.7], 1);
                enginePanel.alignChildren = "fill";
                enginePanel.margins = 10;
                enginePanel.spacing = 5;
                
                pal.rigTabs = enginePanel.add("tabbedpanel");
                pal.rigTabs.alignChildren = "fill";
                
                var createPresetRow = function(parent, type, rigName) {
                    var g = parent.add('group'); g.orientation = 'row'; g.alignChildren = ['left', 'center'];
                    g.add('statictext', undefined, 'Built-in Preset:');
                    var dd = g.add('dropdownlist'); dd.alignment = 'fill';
                    var copyBtn = g.add('button', undefined, '(C)'); copyBtn.preferredSize.width = 25; copyBtn.helpTip = "Copy " + rigName + " Settings";
                    var pasteBtn = g.add('button', undefined, '(P)'); pasteBtn.preferredSize.width = 25; pasteBtn.helpTip = "Paste " + rigName + " Settings";
                    
                    copyBtn.onClick = function() { MotionEngine.actions.copyPhysics(type); };
                    pasteBtn.onClick = function() { MotionEngine.actions.pastePhysics(type); };
                    
                    return dd;
                };

                pal.bounceTab = pal.rigTabs.add("tab", undefined, "Bounce");
                pal.bounceTab.spacing = 8; pal.bounceTab.margins = 10; pal.bounceTab.alignChildren = 'fill';
                pal.bouncePresetDropdown = createPresetRow(pal.bounceTab, 'bounce', 'Bounce');
                for (var p1 in MotionEngine.data.bouncePresetData) { pal.bouncePresetDropdown.add('item', p1); }
                pal.bouncePresetDropdown.selection = 0;
                
                var createUserPresetRow = function(parent, type) { var g = parent.add('group'); g.orientation = 'row'; g.alignChildren = ['left', 'center']; g.add('statictext', undefined, 'User Presets:'); var dd = g.add('dropdownlist'); dd.alignment = 'fill'; var saveBtn = g.add('button', undefined, '+'); saveBtn.preferredSize.width = 25; saveBtn.helpTip = "Save current rig settings as a new preset"; var delBtn = g.add('button', undefined, 'x'); delBtn.preferredSize.width = 25; delBtn.helpTip = "Delete selected user preset"; saveBtn.onClick = function() { MotionEngine.actions.saveUserPreset(type); }; delBtn.onClick = function() { MotionEngine.actions.deleteUserPreset(type); }; dd.onChange = function() { if (this.selection !== null) { if (type === 'bounce') pal.bouncePresetDropdown.selection = null; else if (type === 'sns') pal.snsPresetDropdown.selection = null; else if (type === 'wiggle') pal.wigglePresetDropdown.selection = null; } }; return dd; };
                
                pal.bounceUserPresetDropdown = createUserPresetRow(pal.bounceTab, 'bounce');
                
                pal.nonDestructiveBounceCheckbox = pal.bounceTab.add("checkbox", undefined, "Non-Destructive (Uses Parent Rig)");
                pal.nonDestructiveBounceCheckbox.helpTip = "Creates a controller null to hold Position keyframes, keeping your original layer clean.";
                
                var tipsText = pal.bounceTab.add("statictext", undefined, 
                    "Best Practices:\n• Requires existing keyframes to generate physics.\n• Works on Position, Scale, and Rotation properties.\n• Ensure 'Separate Dimensions' is OFF for Position.", 
                { multiline: true });
                tipsText.alignment = 'fill';
                tipsText.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 10);
                tipsText.graphics.foregroundColor = tipsText.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                
                pal.snsTab = pal.rigTabs.add("tab", undefined, "Squash & Stretch");
                pal.snsTab.spacing = 8; pal.snsTab.margins = 10; pal.snsTab.alignChildren = 'fill';
                pal.snsPresetDropdown = createPresetRow(pal.snsTab, 'sns', 'SnS');
                for (var p2 in MotionEngine.data.snsPresetData) { pal.snsPresetDropdown.add('item', p2); }
                pal.snsPresetDropdown.selection = 0;
                pal.snsUserPresetDropdown = createUserPresetRow(pal.snsTab, 'sns');
                
                pal.invertSnsCheckbox = pal.snsTab.add("checkbox", undefined, "Invert Axes (Stretch Horizontally)");
                pal.invertSnsCheckbox.value = false;
                pal.invertSnsCheckbox.helpTip = "Swaps the default physics behavior. The layer will get wider as it moves and taller on impact.";

                pal.nonDestructiveSnsCheckbox = pal.snsTab.add("checkbox", undefined, "Non-Destructive (Uses Parent Rig)");
                pal.nonDestructiveSnsCheckbox.helpTip = "Creates a controller null to hold Position keyframes, keeping your original layer clean.";
                
                pal.snsTab.add("panel");
                var snsPerformanceTip = pal.snsTab.add("statictext", undefined, 
                    "Performance Tip: For 10+ layers, use the 'Bake' panel after applying to ensure real-time playback.", 
                { multiline: true });
                snsPerformanceTip.alignment = 'fill';
                snsPerformanceTip.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 10);
                snsPerformanceTip.graphics.foregroundColor = snsPerformanceTip.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);

                pal.wiggleTab = pal.rigTabs.add("tab", undefined, "Wiggle");
                pal.wiggleTab.spacing = 8; pal.wiggleTab.margins = 10; pal.wiggleTab.alignChildren = 'fill';
                pal.wigglePresetDropdown = createPresetRow(pal.wiggleTab, 'wiggle', 'Wiggle');
                for (var p3 in MotionEngine.data.wigglePresetData) { pal.wigglePresetDropdown.add('item', p3); }
                pal.wigglePresetDropdown.selection = 0;
                pal.wiggleUserPresetDropdown = createUserPresetRow(pal.wiggleTab, 'wiggle');
                
                pal.wiggleTab.add("panel"); 
                var loopGroup = pal.wiggleTab.add("group");
                loopGroup.orientation = "row";
                loopGroup.alignChildren = ["left", "center"];
                loopGroup.spacing = 10;
                pal.loopWiggleCheckbox = loopGroup.add("checkbox", undefined, "Create Seamless Loop");
                pal.loopWiggleCheckbox.helpTip = "Creates a mathematically perfect, seamless loop. Essential for GIFs and social media content.";
                
                var loopDurationGroup = loopGroup.add("group");
                loopDurationGroup.orientation = "row";
                loopDurationGroup.alignChildren = ["left", "center"];
                loopDurationGroup.spacing = 2;
                loopDurationGroup.add("statictext", undefined, "Loop Duration (sec):");
                pal.loopWiggleDuration = loopDurationGroup.add("edittext", undefined, "2.0");
                pal.loopWiggleDuration.preferredSize.width = 40;
                loopDurationGroup.enabled = false;

                pal.loopWiggleCheckbox.onClick = function() {
                    loopDurationGroup.enabled = this.value;
                };
                pal.wiggleTab.add("panel"); 
                
                var wiggleWarning = pal.wiggleTab.add("statictext", undefined, "Note: Wiggle is generative and overwrites existing keyframes. Use the option below to apply it on top of your animation.", {multiline:true});
                wiggleWarning.alignment = 'fill';
                wiggleWarning.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 10);
                wiggleWarning.graphics.foregroundColor = wiggleWarning.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                
                pal.additiveWiggleCheckbox = pal.wiggleTab.add("checkbox", undefined, "Don't Overwrite Keyframes (Uses Parent Rig)");
                pal.additiveWiggleCheckbox.helpTip = "WARNING: Preserves your keyframes by moving them to a new parent null, then applies the Wiggle effect to the original layer.";
                
                pal.rigTabs.selection = 0;
                
                var unifiedBtnGroup = enginePanel.add('group');
                unifiedBtnGroup.orientation = 'row';
                unifiedBtnGroup.alignment = 'fill';
                unifiedBtnGroup.spacing = 10;
                pal.applyBtn = unifiedBtnGroup.add("button", undefined, "Apply / Update Selected Rig");
                pal.applyBtn.alignment = ['fill', 'center'];
                pal.applyBtn.helpTip = "Applies the selected rig to the currently selected layer.";
                pal.removeBtn = unifiedBtnGroup.add("button", undefined, "Remove Selected Rig");
                pal.removeBtn.alignment = ['fill', 'center'];
                pal.removeBtn.preferredSize.width = 120;
                pal.removeBtn.helpTip = "Removes the rig from the currently selected tab and its expressions from the selected layer(s).";
                
                var toolkitPanel = pal.add("panel", undefined, "2. Manage & Refine");
                toolkitPanel.alignChildren = "fill";
                toolkitPanel.margins = 10;
                toolkitPanel.spacing = 8;
                
                var activationPanel = toolkitPanel.add("panel", undefined, "Wiggle Activation Control");
                activationPanel.alignChildren = "fill";
                activationPanel.add("statictext", undefined, "Control Wiggle rig timing using comp markers.").graphics.foregroundColor = activationPanel.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                var markerBtnGroup = activationPanel.add("group");
                markerBtnGroup.orientation = "row";
                markerBtnGroup.alignment = 'fill';
                pal.createMarkersBtn = markerBtnGroup.add("button", undefined, "Create Markers");
                pal.createMarkersBtn.helpTip = "Creates 'Rig_Start' and 'Rig_End' markers in your comp at the current time.";
                pal.linkToMarkersBtn = markerBtnGroup.add("button", undefined, "Link Wiggle to Markers");
                pal.linkToMarkersBtn.helpTip = "Links the selected layers' Wiggle rig 'Enable' property to the comp markers.";
                pal.unlinkFromMarkersBtn = markerBtnGroup.add("button", undefined, "Unlink Wiggle Rig");
                pal.unlinkFromMarkersBtn.helpTip = "Removes the marker expression from the Wiggle rig's 'Enable' property.";
                
                var axisPanel = toolkitPanel.add("panel", undefined, "Axis Isolation");
                axisPanel.alignChildren = "fill";
                axisPanel.add("statictext", undefined, "Apply physics to a single axis (X, Y, or Z).").graphics.foregroundColor = axisPanel.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                var axisBtnGroup = axisPanel.add("group");
                axisBtnGroup.orientation = "row";
                axisBtnGroup.alignment = 'fill';
                pal.isolateAxesBtn = axisBtnGroup.add("button", undefined, "Isolate Selected Property Axes");
                pal.isolateAxesBtn.helpTip = "Select a property (e.g. Position), click this to create individual X, Y, Z slider controls.";
                pal.removeIsolationBtn = axisBtnGroup.add("button", undefined, "Remove Isolation");
                pal.removeIsolationBtn.helpTip = "Select a layer to remove all axis isolation controls and bake the animation back to the original properties.";

                var globalControlsPanel = toolkitPanel.add("panel", undefined, "Global Preview Controls");
                globalControlsPanel.alignChildren = "fill";
                globalControlsPanel.add("statictext", undefined, "Temporarily disable rigs to isolate animation.").graphics.foregroundColor = globalControlsPanel.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.7], 1);
                var proWorkflowGroup = globalControlsPanel.add('group');
                proWorkflowGroup.orientation = 'row';
                proWorkflowGroup.alignment = 'center';
                proWorkflowGroup.spacing = 10;
                pal.soloBtn = proWorkflowGroup.add('button', undefined, '(S) Solo Physics');
                pal.soloBtn.helpTip = "Select ONE layer to temporarily disable all other Momentum rigs in the comp.";
                pal.unSoloBtn = proWorkflowGroup.add('button', undefined, '(X) Un-Solo');
                pal.unSoloBtn.helpTip = "Restore all rigs after using Solo mode.";
                pal.unSoloBtn.enabled = false;
                pal.bypassCheckbox = proWorkflowGroup.add('checkbox', undefined, 'Bypass All');
                pal.bypassCheckbox.helpTip = 'Temporarily disable all Momentum rigs in this comp for previewing raw animation.';
                
                var bakePanel = pal.add("panel", undefined, "3. Finalize & Bake");
                bakePanel.graphics.foregroundColor = bakePanel.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, [0.8, 0.5, 0.5], 1);
                bakePanel.alignChildren = "fill";
                bakePanel.margins = 10;
                bakePanel.spacing = 8;
                pal.duplicateCheckbox = bakePanel.add("checkbox", undefined, "Bake to Duplicate Layer (Recommended)");
                pal.duplicateCheckbox.value = true;
                pal.duplicateCheckbox.helpTip = "Creates a clean, baked copy of the layer while safely preserving the original rig (hidden).";
                var samplingRow = bakePanel.add("group");
                samplingRow.orientation = "row";
                samplingRow.alignChildren = ["left", "center"];
                samplingRow.add("statictext", undefined, "Sampling Rate:");
                pal.samplingDropdown = samplingRow.add("dropdownlist", undefined, ["1.0", "2.0", "4.0"]);
                pal.samplingDropdown.selection = 0;
                pal.samplingDropdown.helpTip = "Keys per frame. Higher values create more keys for smoother motion blur or slow motion. '1.0' is standard.";
                var styleRow = bakePanel.add("group");
                styleRow.orientation = "row";
                styleRow.alignChildren = "fill";
                pal.holdCheckbox = styleRow.add("checkbox", undefined, "Bake to Hold Keyframes");
                pal.holdCheckbox.helpTip = "Bakes animation to 'hold' keyframes for a stylized, stop-motion effect.";
                
                var holdOptionsGroup = styleRow.add("group");
                holdOptionsGroup.orientation = "row";
                holdOptionsGroup.alignChildren = ["left", "center"];
                holdOptionsGroup.spacing = 2;
                holdOptionsGroup.add("statictext", undefined, "Hold Every:");
                pal.holdRateDropdown = holdOptionsGroup.add("dropdownlist", undefined, ["1", "2", "3", "4", "6", "8"]);
                pal.holdRateDropdown.selection = 1;
                holdOptionsGroup.enabled = false;

                bakePanel.add("panel"); 

                pal.simplifyKeysCheckbox = bakePanel.add("checkbox", undefined, "Simplify Keyframes");
                pal.simplifyKeysCheckbox.value = true;
                pal.simplifyKeysCheckbox.helpTip = "After baking, removes redundant keyframes to clean up your timeline. Highly recommended.";
                
                pal.holdCheckbox.onClick = function() {
                    if (this.value) {
                        pal.simplifyKeysCheckbox.value = false;
                        pal.simplifyKeysCheckbox.enabled = false;
                        holdOptionsGroup.enabled = true;
                    } else {
                        pal.simplifyKeysCheckbox.enabled = true;
                        pal.simplifyKeysCheckbox.value = true;
                        holdOptionsGroup.enabled = false;
                    }
                };
                
                pal.bakeBtn = bakePanel.add("button", undefined, "Bake All/Selected Momentum Rigs");
                pal.bakeBtn.alignment = ['fill', 'center'];
                pal.bakeBtn.helpTip = "Bakes any selected properties with Momentum rigs, or all rigs on selected layers if no properties are selected.";
                
                var statusPanel = pal.add("panel");
                statusPanel.orientation = "column";
                statusPanel.alignChildren = "fill";
                statusPanel.margins = [10, 5, 10, 5];
                statusPanel.spacing = 2;
                pal.statusText = statusPanel.add('statictext', undefined, 'Select a layer and click Refresh...', { justify: 'left', multiline: false });
                pal.statusText.graphics.font = ScriptUI.newFont("Arial", "ITALIC", 11);
                var statusBtnGroup = statusPanel.add("group");
                statusBtnGroup.alignment = 'right';
                var refreshUIBtn = statusBtnGroup.add("button", undefined, "Refresh for Selection");
                refreshUIBtn.helpTip = "Updates the UI to reflect the rigs on the currently selected layer.";
                var refreshBtn = statusBtnGroup.add('button', undefined, 'Clear');
                refreshBtn.preferredSize.width = 50;
                refreshBtn.helpTip = "Clear Status Message";

                refreshUIBtn.onClick = function() { MotionEngine.ui.refreshForSelection(); MotionEngine.ui.showStatus("UI refreshed for selection.", "success");};
                refreshBtn.onClick = function() { MotionEngine.ui.showStatus("Ready."); };
                
                quickBounceBtn.onClick = function() { pal.rigTabs.selection = pal.bounceTab; pal.bouncePresetDropdown.selection = 0; MotionEngine.actions.applyRig(); };
                quickSnsBtn.onClick = function() { pal.rigTabs.selection = pal.snsTab; pal.snsPresetDropdown.selection = 0; MotionEngine.actions.applySnsRig(); };
                quickWiggleBtn.onClick = function() { pal.rigTabs.selection = pal.wiggleTab; pal.wigglePresetDropdown.selection = 0; MotionEngine.actions.applyRig(); };
                
                pal.rigTabs.onChange = function() { MotionEngine.ui.refreshForSelection(); };

                pal.bypassCheckbox.onClick = function() { MotionEngine.actions.toggleGlobalBypass(this.value); if(!this.value && MotionEngine.data.isSoloed) { MotionEngine.actions.unSoloRig(); } };
                pal.soloBtn.onClick = function() { MotionEngine.actions.soloRig(); };
                pal.unSoloBtn.onClick = function() { MotionEngine.actions.unSoloRig(); };
                pal.applyBtn.onClick = function() { MotionEngine.actions.applyRig(); };
                pal.removeBtn.onClick = function() { MotionEngine.actions.removeRig(); };
                pal.bakeBtn.onClick = function() { MotionEngine.actions.bakeUnifiedRigs(); };
                pal.createMarkersBtn.onClick = function() { MotionEngine.actions.createActivationMarkers(); };
                pal.linkToMarkersBtn.onClick = function() { MotionEngine.actions.linkRigToMarkers(); };
                pal.unlinkFromMarkersBtn.onClick = function() { MotionEngine.actions.unlinkRigFromMarkers(); };
                pal.isolateAxesBtn.onClick = function() { MotionEngine.actions.isolateSelectedAxes(); };
                pal.removeIsolationBtn.onClick = function() { MotionEngine.actions.removeAxisIsolation(); };

                pal.layout.layout(true);
                pal.onResizing = pal.onResize = function () { this.layout.resize(); };
                
                MotionEngine.core.loadUserPresets();
                this.updateUserPresetDropdowns();

                if (pal instanceof Window) { pal.center(); pal.show(); }
            },
            updateUserPresetDropdowns: function() { var bounceDD = this.pal.bounceUserPresetDropdown; var snsDD = this.pal.snsUserPresetDropdown; var wiggleDD = this.pal.wiggleUserPresetDropdown; bounceDD.removeAll(); snsDD.removeAll(); wiggleDD.removeAll(); for(var p1 in MotionEngine.data.userPresets.bounce) { bounceDD.add("item", p1); } for(var p2 in MotionEngine.data.userPresets.sns) { snsDD.add("item", p2); } for(var p3 in MotionEngine.data.userPresets.wiggle) { wiggleDD.add("item", p3); } },
            showHelpDialog: function() {
                var w = new Window("dialog", "About Momentum", undefined, {resizeable: true});
                w.orientation = "column"; w.alignChildren = ["fill", "top"]; w.spacing = 10; w.margins = 15;
                var mainGroup = w.add("group");
                mainGroup.orientation = "column";
                mainGroup.alignChildren = ["center", "top"];
                mainGroup.alignment = 'fill';

                var titleGroup = mainGroup.add("group");
                var title = titleGroup.add("statictext", undefined, "Momentum by ");
                title.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);
                var titleName = titleGroup.add("statictext", undefined, "RANA");
                titleName.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);
                titleName.graphics.foregroundColor = titleName.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [0.4, 0.8, 0.7], 1);
                var titleVersion = titleGroup.add("statictext", undefined, " (v" + MotionEngine.config.version + ")");
                titleVersion.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);

                titleName.addEventListener("click", function() {
                    var storyWindow = new Window("dialog", "A Note from the Creator");
                    storyWindow.orientation = "column";
                    storyWindow.alignChildren = ["fill", "top"];
                    storyWindow.margins = 20;
                    storyWindow.spacing = 15;
                    var storyText = "Hey, that's my name! (ain't nobody got the vibe like Rana)\n\n" +
                                "My name is RANA. I'm a 19-year-old developer from Pakistan with a mission to build beautiful, high-leverage tools for creators.\n\n" +
                                "This script is part of my 'Operation $1K Escape Velocity'—a goal to build a sustainable creative business with a 100% halal work ethic.\n\n" +
                                "If you believe in building systems over shortcuts, let's connect. You can find me on X (Twitter) @vibe_like_rana.\n\n" +
                                "Thank you for believing in Momentum.";
                    var textElement = storyWindow.add("statictext", undefined, storyText, {multiline: true});
                    textElement.alignment = ['fill', 'top'];
                    storyWindow.add("button", undefined, "Close", {name: "ok"});
                    storyWindow.center();
                    storyWindow.show();
                });

                mainGroup.add("panel");

                var conceptsPanel = mainGroup.add("panel", undefined, "Core Concepts & Best Practices");
                conceptsPanel.alignChildren = ['fill', 'top'];
                conceptsPanel.alignment = 'fill';
                conceptsPanel.margins = 15;
                
                var guideText1 = conceptsPanel.add("statictext", undefined, "1. Understand the Difference:", {multiline:true});
                guideText1.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
                var guideText1_body = conceptsPanel.add("statictext", undefined, "• Bounce & Squash/Stretch are Reactive: They add secondary motion to your existing keyframes.\n• Wiggle is Generative: It creates new motion and will overwrite your keyframes by default.", {multiline:true});

                var guideText2 = conceptsPanel.add("statictext", undefined, "2. Non-Destructive Workflow:", {multiline:true});
                guideText2.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
                var guideText2_body = conceptsPanel.add("statictext", undefined, "• To preserve your keyframes, check 'Non-Destructive'. This moves your Position keyframes to a '[Momentum Ctrl]' null and applies physics to the original layer.\n• To edit your animation, you MUST select and edit the keyframes on the controller null.", {multiline:true});

                var guideText3 = conceptsPanel.add("statictext", undefined, "3. Key Requirements:", {multiline:true});
                guideText3.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
                var guideText3_body = conceptsPanel.add("statictext", undefined, "• All rigs need Position keyframes to calculate velocity.\n• For Position physics, always disable 'Separate Dimensions'.", {multiline:true});

                var guideText4 = conceptsPanel.add("statictext", undefined, "4. The Ideal Workflow:", {multiline:true});
                guideText4.graphics.font = ScriptUI.newFont("Arial", "BOLD", 11);
                var guideText4_body = conceptsPanel.add("statictext", undefined, "① Animate your Position.\n② Check 'Non-Destructive' and apply Bounce and/or S&S.\n③ Refine animation on the '[Momentum Ctrl]' null.\n④ Bake rigs to a clean layer for final rendering.", {multiline:true});
                
                var guideColor = [0.8, 0.8, 0.8];
                var allBodies = [guideText1_body, guideText2_body, guideText3_body, guideText4_body];
                for(var i = 0; i < allBodies.length; i++){
                    allBodies[i].graphics.foregroundColor = allBodies[i].graphics.newPen(w.graphics.PenType.SOLID_COLOR, guideColor, 1);
                    allBodies[i].alignment = 'fill';
                }
                
                var creatorPanel = mainGroup.add("panel", undefined, "Creator & Community");
                creatorPanel.alignment = 'fill';
                creatorPanel.alignChildren = "center";
                creatorPanel.margins = 10;
                var twitter = MotionEngine.config.socials.twitter;
                var twitterBtn = creatorPanel.add("button", undefined, "Follow on X (Twitter)");
                twitterBtn.helpTip = twitter.url;
                twitterBtn.onClick = function() { MotionEngine.core.openURL(twitter.url); };
                var community = MotionEngine.config.socials.community;
                var communityBtn = creatorPanel.add("button", undefined, "Visit GitHub for Support & Updates");
                communityBtn.helpTip = community.url;
                communityBtn.onClick = function() { MotionEngine.core.openURL(community.url); };

                mainGroup.add("button", undefined, "Close", { name: "ok" }).alignment = "center";
                
                w.layout.layout(true);
                w.onResizing = w.onResize = function() { this.layout.resize(); };
                w.center();
                w.show();
            },
            showStatus: function(message, type) {
                if (!this.pal || !this.pal.statusText) return;
                var pal = this.pal;
                pal.statusText.text = message;
                var color = [0.6, 0.6, 0.6]; 
                if (type === 'success') { color = [0.2, 0.8, 0.2]; } 
                else if (type === 'warning') { color = [0.9, 0.7, 0.2]; } 
                else if (type === 'error') { color = [1.0, 0.3, 0.3]; }
                pal.statusText.graphics.foregroundColor = pal.statusText.graphics.newPen(pal.graphics.PenType.SOLID_COLOR, color, 1);
            },
            refreshForSelection: function() {
                var pal = MotionEngine.ui.pal;
                var comp = app.project.activeItem;

                pal.bounceTab.text = "Bounce";
                pal.snsTab.text = "Squash & Stretch";
                pal.wiggleTab.text = "Wiggle";
                MotionEngine.data.activeRigs = { bounce: false, sns: false, wiggle: false };

                if (!comp || !(comp instanceof CompItem) || comp.selectedLayers.length !== 1) {
                    pal.applyBtn.text = "Apply / Update Rig";
                    return;
                }

                var layer = comp.selectedLayers[0];
                var activeRigs = MotionEngine.data.activeRigs;
                
                try {
                    if (layer.Effects.property(MotionEngine.config.bounceConfig.rigPrefix + "Enable")) {
                        activeRigs.bounce = true;
                        pal.bounceTab.text = "Bounce ●";
                    }
                    var snsTarget = layer;
                    if (layer.parent && layer.parent.name.indexOf(MotionEngine.config.controllerName) === 0) snsTarget = layer;
                    if (snsTarget.Effects.property(MotionEngine.config.snsConfig.rigPrefix + "Enable")) {
                        activeRigs.sns = true;
                        pal.snsTab.text = "Squash & Stretch ●";
                    }
                    var wiggleTarget = layer;
                    if (layer.parent && layer.parent.name.indexOf("[Wiggle Ctrl]") === 0) wiggleTarget = layer.parent;
                    if (wiggleTarget.Effects.property(MotionEngine.config.wiggleConfig.rigPrefix + "Enable")) {
                        activeRigs.wiggle = true;
                        pal.wiggleTab.text = "Wiggle ●";
                    }
                } catch(e) { }

                var currentTab = pal.rigTabs.selection;
                if (currentTab === pal.bounceTab) {
                    pal.applyBtn.text = activeRigs.bounce ? "Update Bounce Rig" : "Apply Bounce Rig";
                } else if (currentTab === pal.snsTab) {
                    pal.applyBtn.text = activeRigs.sns ? "Update S&S Rig" : "Apply S&S Rig";
                } else if (currentTab === pal.wiggleTab) {
                    pal.applyBtn.text = activeRigs.wiggle ? "Update Wiggle Rig" : "Apply Wiggle Rig";
                }
            }
        }
    };
    
    if (MotionEngine.core.hasRequiredPermissions()) {
        MotionEngine.ui.build();
    }

})(this);
