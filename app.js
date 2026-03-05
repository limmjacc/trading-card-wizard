(function () {
  "use strict";

  var CARD_WIDTH = 734;
  var CARD_HEIGHT = 1024;
  var STORAGE_KEY = "tcw-state-v1";
  var STATUS_MS = 3800;

  var DEFAULT_STATE = {
    stage: "BASIC",
    name: "Pikachu",
    hp: 60,
    typeSymbol: "⚡",
    cardNumber: "NO.025",
    species: "Mouse Pokemon",
    height: "1'04\"",
    weight: "13.2 lbs",
    move1: {
      cost: "⚡",
      name: "Energize",
      text: "Attach a ⚡ Energy card from your discard pile to this Pokemon."
    },
    move2: {
      cost: "⚡ ✶ ✶",
      name: "Thunderbolt",
      damage: 80,
      text: "Discard all Energy attached to this Pokemon."
    },
    weakness: "💥 x2",
    resistance: "—",
    retreat: "✶",
    flavorText: "This is an extremely rare Pikachu card. You're very lucky to have found it!",
    illustrator: "Kouki Saitou",
    collectorNumber: "115/114",
    year: "2026",
    artDataUrl: "",
    art: {
      zoom: 100,
      offsetX: 0,
      offsetY: 0
    },
    visual: {
      hueShift: -2,
      saturation: 106,
      texture: 46,
      cornerRadius: 34
    },
    exportScale: 3
  };

  var state = sanitizeState(loadStateFromStorage() || DEFAULT_STATE);
  var defaultArtImage = null;
  var customArtImage = null;
  var noisePatternCanvas = null;
  var renderQueued = false;
  var autosaveTimer = 0;
  var statusTimer = 0;

  var canvas = document.getElementById("cardCanvas");
  var ctx = canvas.getContext("2d");
  var statusEl = document.getElementById("statusMessage");

  var inputMap = {
    stage: "stage",
    cardName: "name",
    typeSymbol: "typeSymbol",
    cardNumber: "cardNumber",
    species: "species",
    heightText: "height",
    weightText: "weight",
    move1Cost: "move1.cost",
    move1Name: "move1.name",
    move1Text: "move1.text",
    move2Cost: "move2.cost",
    move2Name: "move2.name",
    move2Text: "move2.text",
    weakness: "weakness",
    resistance: "resistance",
    retreat: "retreat",
    flavorText: "flavorText",
    illustrator: "illustrator",
    collectorNumber: "collectorNumber",
    yearText: "year"
  };

  var rangeMap = {
    artZoom: "art.zoom",
    artOffsetX: "art.offsetX",
    artOffsetY: "art.offsetY",
    hueShift: "visual.hueShift",
    saturation: "visual.saturation",
    texture: "visual.texture",
    cornerRadius: "visual.cornerRadius"
  };

  init();

  function init() {
    bindTextInputs();
    bindRangeInputs();
    bindNumberPairs();
    bindButtons();
    hydrateControls();
    loadDefaultArt();
    loadCustomArt(state.artDataUrl);
    queueRender();
  }

  function bindTextInputs() {
    Object.keys(inputMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.addEventListener("input", function () {
        setPath(state, inputMap[id], el.value);
        scheduleAutosave();
        queueRender();
      });
    });

    var exportScale = document.getElementById("exportScale");
    exportScale.addEventListener("change", function () {
      state.exportScale = clampInt(exportScale.value, 2, 5, 3);
      scheduleAutosave();
    });
  }

  function bindRangeInputs() {
    Object.keys(rangeMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.addEventListener("input", function () {
        var path = rangeMap[id];
        var min = numberOrDefault(el.min, -9999);
        var max = numberOrDefault(el.max, 9999);
        var current = clampInt(el.value, min, max, min);
        setPath(state, path, current);
        scheduleAutosave();
        queueRender();
      });
    });
  }

  function bindNumberPairs() {
    bindPair("hpRange", "hpNumber", "hp", 10, 300);
    bindPair("move2DamageRange", "move2Damage", "move2.damage", 0, 300);
  }

  function bindPair(rangeId, numberId, path, min, max) {
    var rangeEl = document.getElementById(rangeId);
    var numEl = document.getElementById(numberId);

    function updateFrom(value) {
      var clean = clampInt(value, min, max, min);
      setPath(state, path, clean);
      rangeEl.value = String(clean);
      numEl.value = String(clean);
      scheduleAutosave();
      queueRender();
    }

    rangeEl.addEventListener("input", function () {
      updateFrom(rangeEl.value);
    });
    numEl.addEventListener("input", function () {
      updateFrom(numEl.value);
    });
  }

  function bindButtons() {
    var savePresetBtn = document.getElementById("savePreset");
    var loadPresetBtn = document.getElementById("loadPreset");
    var downloadPresetBtn = document.getElementById("downloadPreset");
    var uploadPresetBtn = document.getElementById("uploadPresetButton");
    var uploadPresetInput = document.getElementById("uploadPresetInput");
    var exportPngBtn = document.getElementById("exportPng");
    var exportJpgBtn = document.getElementById("exportJpg");
    var artUpload = document.getElementById("artUpload");
    var clearArtBtn = document.getElementById("clearArt");
    var resetCardBtn = document.getElementById("resetCard");

    savePresetBtn.addEventListener("click", function () {
      saveStateToStorage(state);
      setStatus("Preset saved to local storage.", false);
    });

    loadPresetBtn.addEventListener("click", function () {
      var loaded = loadStateFromStorage();
      if (!loaded) {
        setStatus("No saved preset found in local storage.", true);
        return;
      }
      state = sanitizeState(loaded);
      hydrateControls();
      loadCustomArt(state.artDataUrl);
      queueRender();
      setStatus("Preset loaded from local storage.", false);
    });

    downloadPresetBtn.addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json"
      });
      downloadBlob(blob, "trading-card-preset.json");
      setStatus("Preset JSON downloaded.", false);
    });

    uploadPresetBtn.addEventListener("click", function () {
      uploadPresetInput.value = "";
      uploadPresetInput.click();
    });

    uploadPresetInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      readFileAsText(file, function (error, text) {
        if (error) {
          setStatus("Could not read preset JSON.", true);
          return;
        }
        try {
          var parsed = JSON.parse(text);
          state = sanitizeState(parsed);
          hydrateControls();
          loadCustomArt(state.artDataUrl);
          queueRender();
          saveStateToStorage(state);
          setStatus("Preset JSON loaded.", false);
        } catch (parseError) {
          setStatus("Invalid JSON file.", true);
        }
      });
    });

    exportPngBtn.addEventListener("click", function () {
      exportCard("png");
    });

    exportJpgBtn.addEventListener("click", function () {
      exportCard("jpg");
    });

    artUpload.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      if (!/^image\//.test(file.type)) {
        setStatus("Please choose an image file.", true);
        return;
      }
      readFileAsDataUrl(file, function (error, dataUrl) {
        if (error) {
          setStatus("Could not load image file.", true);
          return;
        }
        state.artDataUrl = dataUrl;
        loadCustomArt(dataUrl);
        scheduleAutosave();
        queueRender();
        setStatus("Custom artwork loaded.", false);
      });
    });

    clearArtBtn.addEventListener("click", function () {
      state.artDataUrl = "";
      customArtImage = null;
      scheduleAutosave();
      queueRender();
      setStatus("Default artwork restored.", false);
    });

    resetCardBtn.addEventListener("click", function () {
      state = sanitizeState(DEFAULT_STATE);
      hydrateControls();
      loadCustomArt("");
      saveStateToStorage(state);
      queueRender();
      setStatus("Card reset to default values.", false);
    });
  }

  function hydrateControls() {
    Object.keys(inputMap).forEach(function (id) {
      var path = inputMap[id];
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.value = String(getPath(state, path) || "");
    });

    setPairValue("hpRange", "hpNumber", state.hp);
    setPairValue("move2DamageRange", "move2Damage", state.move2.damage);

    Object.keys(rangeMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.value = String(getPath(state, rangeMap[id]));
    });

    var exportScale = document.getElementById("exportScale");
    exportScale.value = String(state.exportScale);
  }

  function setPairValue(rangeId, numberId, value) {
    var rangeEl = document.getElementById(rangeId);
    var numEl = document.getElementById(numberId);
    rangeEl.value = String(value);
    numEl.value = String(value);
  }

  function loadDefaultArt() {
    var image = new Image();
    image.onload = function () {
      defaultArtImage = image;
      queueRender();
    };
    image.onerror = function () {
      defaultArtImage = null;
      queueRender();
    };
    image.src = "./example-card.jpeg";
  }

  function loadCustomArt(dataUrl) {
    if (!dataUrl) {
      customArtImage = null;
      queueRender();
      return;
    }
    var image = new Image();
    image.onload = function () {
      customArtImage = image;
      queueRender();
    };
    image.onerror = function () {
      customArtImage = null;
      setStatus("Could not decode saved artwork.", true);
      queueRender();
    };
    image.src = dataUrl;
  }

  function queueRender() {
    if (renderQueued) {
      return;
    }
    renderQueued = true;
    window.requestAnimationFrame(function () {
      renderQueued = false;
      drawCard(ctx, state, 1);
    });
  }

  function drawCard(targetCtx, drawState, scale) {
    var S = scale || 1;
    var radius = clampInt(drawState.visual.cornerRadius, 20, 56, 36);
    var hue = 50 + clampInt(drawState.visual.hueShift, -35, 35, 0);
    var saturation = clampInt(drawState.visual.saturation, 60, 150, 100);
    var texture = clampInt(drawState.visual.texture, 0, 100, 38);

    targetCtx.clearRect(0, 0, CARD_WIDTH * S, CARD_HEIGHT * S);
    targetCtx.save();
    targetCtx.scale(S, S);

    drawShadow(targetCtx, radius);
    drawOuterFrame(targetCtx, radius, hue, saturation);
    drawInnerPanel(targetCtx, radius - 12, hue, saturation, texture);
    drawHeader(targetCtx, drawState);
    drawArtArea(targetCtx, drawState);
    drawInfoStrip(targetCtx, drawState);
    drawAttacks(targetCtx, drawState);
    drawFooter(targetCtx, drawState);

    targetCtx.restore();
  }

  function drawShadow(targetCtx, radius) {
    targetCtx.save();
    targetCtx.globalAlpha = 0.28;
    targetCtx.fillStyle = "#24190a";
    roundedRect(targetCtx, 26, 26, 686, 976, radius + 6);
    targetCtx.fill();
    targetCtx.restore();
  }

  function drawOuterFrame(targetCtx, radius, hue, saturation) {
    var outer = { x: 18, y: 18, w: 698, h: 988 };
    var grad = targetCtx.createLinearGradient(outer.x, outer.y, outer.x, outer.y + outer.h);
    grad.addColorStop(0, hsl(hue + 1, 90 * saturationScale(saturation), 80));
    grad.addColorStop(0.42, hsl(hue, 83 * saturationScale(saturation), 68));
    grad.addColorStop(0.72, hsl(hue - 1, 84 * saturationScale(saturation), 70));
    grad.addColorStop(1, hsl(hue + 2, 88 * saturationScale(saturation), 79));

    targetCtx.fillStyle = grad;
    roundedRect(targetCtx, outer.x, outer.y, outer.w, outer.h, radius);
    targetCtx.fill();

    targetCtx.lineWidth = 2.8;
    targetCtx.strokeStyle = hsl(hue - 2, 70 * saturationScale(saturation), 46);
    roundedRect(targetCtx, outer.x + 1.5, outer.y + 1.5, outer.w - 3, outer.h - 3, radius - 1.5);
    targetCtx.stroke();

    targetCtx.lineWidth = 1.5;
    targetCtx.strokeStyle = "rgba(255,255,255,0.48)";
    roundedRect(targetCtx, outer.x + 6, outer.y + 6, outer.w - 12, outer.h - 12, radius - 6);
    targetCtx.stroke();
  }

  function drawInnerPanel(targetCtx, radius, hue, saturation, texture) {
    var panel = { x: 34, y: 34, w: 666, h: 956 };
    var grad = targetCtx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
    grad.addColorStop(0, hsl(hue + 1, 80 * saturationScale(saturation), 75));
    grad.addColorStop(0.3, hsl(hue - 1, 72 * saturationScale(saturation), 66));
    grad.addColorStop(0.7, hsl(hue - 2, 71 * saturationScale(saturation), 64));
    grad.addColorStop(1, hsl(hue + 1, 76 * saturationScale(saturation), 73));

    targetCtx.fillStyle = grad;
    roundedRect(targetCtx, panel.x, panel.y, panel.w, panel.h, radius);
    targetCtx.fill();

    targetCtx.save();
    roundedRect(targetCtx, panel.x + 2, panel.y + 2, panel.w - 4, panel.h - 4, radius - 2);
    targetCtx.clip();

    targetCtx.globalAlpha = clamp(texture / 100 * 0.45, 0, 0.62);
    targetCtx.fillStyle = targetCtx.createPattern(getNoisePatternCanvas(), "repeat");
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);

    var glow = targetCtx.createRadialGradient(150, 110, 20, 300, 290, 530);
    glow.addColorStop(0, "rgba(255,255,220,0.42)");
    glow.addColorStop(1, "rgba(255,255,220,0)");
    targetCtx.fillStyle = glow;
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);

    var darkEdge = targetCtx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
    darkEdge.addColorStop(0, "rgba(120,92,34,0)");
    darkEdge.addColorStop(0.83, "rgba(115,89,31,0.08)");
    darkEdge.addColorStop(1, "rgba(90,67,23,0.14)");
    targetCtx.fillStyle = darkEdge;
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);

    targetCtx.restore();

    targetCtx.lineWidth = 1.4;
    targetCtx.strokeStyle = "rgba(255,255,255,0.62)";
    roundedRect(targetCtx, panel.x + 2, panel.y + 2, panel.w - 4, panel.h - 4, radius - 2);
    targetCtx.stroke();
  }

  function drawHeader(targetCtx, drawState) {
    var header = { x: 42, y: 56, w: 650, h: 66 };

    var bar = targetCtx.createLinearGradient(header.x, header.y, header.x + header.w, header.y);
    bar.addColorStop(0, "#8c8f95");
    bar.addColorStop(0.15, "#eff3f3");
    bar.addColorStop(0.45, "#b8bdc3");
    bar.addColorStop(0.82, "#f2f4f5");
    bar.addColorStop(1, "#83878d");
    targetCtx.fillStyle = bar;
    roundedRect(targetCtx, header.x, header.y, header.w, header.h, 25);
    targetCtx.fill();

    targetCtx.lineWidth = 2.2;
    targetCtx.strokeStyle = "rgba(55,55,55,0.9)";
    roundedRect(targetCtx, header.x + 1, header.y + 1, header.w - 2, header.h - 2, 24);
    targetCtx.stroke();

    var underBand = { x: 74, y: 118, w: 592, h: 18 };
    var underGrad = targetCtx.createLinearGradient(underBand.x, underBand.y, underBand.x, underBand.y + underBand.h);
    underGrad.addColorStop(0, "rgba(248,208,74,0.94)");
    underGrad.addColorStop(1, "rgba(200,162,47,0.95)");
    targetCtx.fillStyle = underGrad;
    roundedRect(targetCtx, underBand.x, underBand.y, underBand.w, underBand.h, 9);
    targetCtx.fill();
    targetCtx.lineWidth = 1.2;
    targetCtx.strokeStyle = "rgba(86,64,18,0.82)";
    roundedRect(targetCtx, underBand.x + 0.5, underBand.y + 0.5, underBand.w - 1, underBand.h - 1, 8.5);
    targetCtx.stroke();

    var stagePanel = { x: header.x + 8, y: header.y + 8, w: 148, h: 50 };
    var stageGrad = targetCtx.createLinearGradient(stagePanel.x, stagePanel.y, stagePanel.x + stagePanel.w, stagePanel.y);
    stageGrad.addColorStop(0, "#bcc4c7");
    stageGrad.addColorStop(0.55, "#edf0f1");
    stageGrad.addColorStop(1, "#a8afb2");
    targetCtx.fillStyle = stageGrad;
    roundedRect(targetCtx, stagePanel.x, stagePanel.y, stagePanel.w, stagePanel.h, 14);
    targetCtx.fill();

    targetCtx.fillStyle = "#4b5359";
    targetCtx.font = "700 19px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(limit(drawState.stage, 14), stagePanel.x + 9, stagePanel.y + 26);

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(390, 58);
    targetCtx.quadraticCurveTo(507, 87, 549, 57);
    targetCtx.lineTo(577, 57);
    targetCtx.quadraticCurveTo(515, 122, 371, 123);
    targetCtx.closePath();
    targetCtx.fillStyle = "rgba(255,255,255,0.55)";
    targetCtx.fill();
    targetCtx.restore();

    targetCtx.fillStyle = "#141414";
    targetCtx.font = "700 50px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "left";
    drawFittedText(targetCtx, limit(drawState.name, 28), 170, 96, 324, 50, 30, "700", "'Trebuchet MS', 'Arial Black', sans-serif");

    targetCtx.textAlign = "right";
    targetCtx.font = "700 26px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("HP", 588, 86);
    targetCtx.font = "700 48px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.fillText(String(drawState.hp), 654, 97);

    drawTypeToken(targetCtx, 672, 88, limit(drawState.typeSymbol || "⚡", 2), 20);
  }

  function drawArtArea(targetCtx, drawState) {
    var frame = { x: 64, y: 138, w: 606, h: 412 };
    var border = targetCtx.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h);
    border.addColorStop(0, "#72757a");
    border.addColorStop(0.42, "#f3f4f4");
    border.addColorStop(0.58, "#b8bbbf");
    border.addColorStop(1, "#666a70");

    targetCtx.fillStyle = border;
    roundedRect(targetCtx, frame.x, frame.y, frame.w, frame.h, 10);
    targetCtx.fill();

    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = "rgba(58,58,58,0.85)";
    roundedRect(targetCtx, frame.x + 1, frame.y + 1, frame.w - 2, frame.h - 2, 9);
    targetCtx.stroke();

    var inner = { x: frame.x + 12, y: frame.y + 12, w: frame.w - 24, h: frame.h - 24 };
    targetCtx.save();
    roundedRect(targetCtx, inner.x, inner.y, inner.w, inner.h, 4);
    targetCtx.clip();

    var artImage = customArtImage || defaultArtImage;
    if (artImage) {
      var zoom = clampInt(drawState.art.zoom, 80, 180, 100);
      var offsetX = clampInt(drawState.art.offsetX, -180, 180, 0);
      var offsetY = clampInt(drawState.art.offsetY, -180, 180, 0);

      if (customArtImage) {
        drawCoverImage(targetCtx, customArtImage, inner.x, inner.y, inner.w, inner.h, zoom, offsetX, offsetY);
      } else {
        drawReferenceCrop(targetCtx, defaultArtImage, inner.x, inner.y, inner.w, inner.h, zoom, offsetX, offsetY);
      }
    } else {
      var sky = targetCtx.createLinearGradient(inner.x, inner.y, inner.x, inner.y + inner.h);
      sky.addColorStop(0, "#bde4ff");
      sky.addColorStop(0.63, "#ecf8ff");
      sky.addColorStop(0.64, "#8eca66");
      sky.addColorStop(1, "#4f8d37");
      targetCtx.fillStyle = sky;
      targetCtx.fillRect(inner.x, inner.y, inner.w, inner.h);
    }

    var haze = targetCtx.createLinearGradient(inner.x, inner.y, inner.x + inner.w, inner.y + inner.h);
    haze.addColorStop(0, "rgba(255,255,255,0.2)");
    haze.addColorStop(0.3, "rgba(255,255,255,0)");
    haze.addColorStop(1, "rgba(0,0,0,0.09)");
    targetCtx.fillStyle = haze;
    targetCtx.fillRect(inner.x, inner.y, inner.w, inner.h);
    targetCtx.restore();

    targetCtx.lineWidth = 1;
    targetCtx.strokeStyle = "rgba(255,255,255,0.55)";
    roundedRect(targetCtx, inner.x + 0.5, inner.y + 0.5, inner.w - 1, inner.h - 1, 3.5);
    targetCtx.stroke();
  }

  function drawInfoStrip(targetCtx, drawState) {
    var strip = { x: 74, y: 553, w: 586, h: 22 };
    var grad = targetCtx.createLinearGradient(strip.x, strip.y, strip.x + strip.w, strip.y);
    grad.addColorStop(0, "#777b80");
    grad.addColorStop(0.16, "#efefef");
    grad.addColorStop(0.84, "#efefef");
    grad.addColorStop(1, "#777b80");

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(strip.x + 10, strip.y);
    targetCtx.lineTo(strip.x + strip.w - 20, strip.y);
    targetCtx.lineTo(strip.x + strip.w, strip.y + strip.h * 0.55);
    targetCtx.lineTo(strip.x + strip.w - 10, strip.y + strip.h);
    targetCtx.lineTo(strip.x + 10, strip.y + strip.h);
    targetCtx.lineTo(strip.x, strip.y + strip.h * 0.5);
    targetCtx.closePath();
    targetCtx.fillStyle = grad;
    targetCtx.fill();
    targetCtx.lineWidth = 1;
    targetCtx.strokeStyle = "rgba(65,65,65,0.85)";
    targetCtx.stroke();
    targetCtx.restore();

    var info = [
      limit(drawState.cardNumber, 24),
      limit(drawState.species, 26),
      "HT: " + limit(drawState.height, 12),
      "WT: " + limit(drawState.weight, 14)
    ].join("  ");

    targetCtx.fillStyle = "#242424";
    targetCtx.font = "400 10px 'Trebuchet MS', sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(info, strip.x + strip.w / 2, strip.y + strip.h / 2 + 0.3);
  }

  function drawAttacks(targetCtx, drawState) {
    drawAttackRow(
      targetCtx,
      {
        y: 620,
        cost: drawState.move1.cost,
        name: drawState.move1.name,
        text: drawState.move1.text,
        damage: ""
      }
    );
    drawAttackRow(
      targetCtx,
      {
        y: 724,
        cost: drawState.move2.cost,
        name: drawState.move2.name,
        text: drawState.move2.text,
        damage: drawState.move2.damage > 0 ? String(drawState.move2.damage) : ""
      }
    );
  }

  function drawAttackRow(targetCtx, attack) {
    var y = attack.y;
    var tokens = tokenizeCost(attack.cost);
    var tokenX = 86;

    for (var i = 0; i < tokens.length; i += 1) {
      drawEnergyToken(targetCtx, tokenX + i * 34, y + 9, tokens[i], 14);
    }

    targetCtx.fillStyle = "#1b1407";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 23px 'Trebuchet MS', 'Arial Black', sans-serif";
    drawFittedText(
      targetCtx,
      limit(attack.name, 24),
      200,
      y + 14,
      attack.damage ? 360 : 430,
      23,
      15,
      "700",
      "'Trebuchet MS', 'Arial Black', sans-serif"
    );

    if (attack.damage) {
      targetCtx.textAlign = "right";
      targetCtx.fillText(attack.damage, 650, y + 14);
    }

    targetCtx.textAlign = "left";
    targetCtx.font = "400 14px 'Trebuchet MS', sans-serif";
    wrapText(targetCtx, attack.text, 76, y + 40, 572, 16.5, 2);
  }

  function drawFooter(targetCtx, drawState) {
    targetCtx.lineWidth = 2.1;
    targetCtx.strokeStyle = "rgba(125,102,36,0.72)";

    targetCtx.beginPath();
    targetCtx.moveTo(76, 850);
    targetCtx.lineTo(364, 850);
    targetCtx.moveTo(76, 906);
    targetCtx.lineTo(364, 906);
    targetCtx.stroke();

    targetCtx.fillStyle = "#3a2d12";
    targetCtx.textAlign = "left";
    targetCtx.font = "700 13px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("weakness", 76, 834);
    targetCtx.fillText("resistance", 194, 834);
    targetCtx.fillText("retreat", 76, 891);

    targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.weakness, 18), 76, 872);
    targetCtx.fillText(limit(drawState.resistance, 18), 194, 872);

    var retreatTokens = tokenizeCost(drawState.retreat).slice(0, 3);
    for (var i = 0; i < retreatTokens.length; i += 1) {
      drawEnergyToken(targetCtx, 126 + i * 26, 927, retreatTokens[i], 10);
    }

    drawFlavorRibbon(targetCtx, drawState.flavorText);

    targetCtx.fillStyle = "#1d1406";
    targetCtx.textAlign = "left";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("©" + limit(drawState.year, 6) + " Trading Card Wizard", 74, 960);

    targetCtx.textAlign = "center";
    targetCtx.font = "italic 13px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("Illus. " + limit(drawState.illustrator, 32), 493, 958);

    targetCtx.textAlign = "right";
    targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.collectorNumber, 12), 644, 956);

    targetCtx.fillStyle = "#1b1811";
    targetCtx.fillRect(660, 935, 22, 22);
    targetCtx.fillStyle = "#f5f5f5";
    targetCtx.fillRect(663.5, 938.5, 6.5, 6.5);
    targetCtx.fillRect(672.5, 947.5, 6.5, 6.5);
  }

  function drawFlavorRibbon(targetCtx, text) {
    var x = 366;
    var y = 850;
    var w = 286;
    var h = 94;

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(x + 16, y);
    targetCtx.lineTo(x + w - 22, y);
    targetCtx.lineTo(x + w, y + 14);
    targetCtx.lineTo(x + w - 16, y + h);
    targetCtx.lineTo(x, y + h);
    targetCtx.lineTo(x + 14, y + 16);
    targetCtx.closePath();

    var grad = targetCtx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "rgba(250,229,130,0.92)");
    grad.addColorStop(0.55, "rgba(255,236,154,0.82)");
    grad.addColorStop(1, "rgba(229,201,97,0.9)");
    targetCtx.fillStyle = grad;
    targetCtx.fill();

    targetCtx.lineWidth = 1.8;
    targetCtx.strokeStyle = "rgba(128,99,36,0.8)";
    targetCtx.stroke();
    targetCtx.restore();

    targetCtx.fillStyle = "#3a280b";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "top";
    targetCtx.font = "italic 15px 'Trebuchet MS', serif";
    wrapText(targetCtx, text, x + 15, y + 16, w - 32, 15, 3);
  }

  function drawTypeToken(targetCtx, x, y, symbol, radius) {
    drawEnergyToken(targetCtx, x, y, symbol, radius);
  }

  function drawEnergyToken(targetCtx, x, y, token, radius) {
    var palette = getEnergyTokenPalette(token);
    var grad = targetCtx.createRadialGradient(
      x - radius * 0.2,
      y - radius * 0.35,
      radius * 0.2,
      x,
      y,
      radius
    );
    grad.addColorStop(0, palette.inner);
    grad.addColorStop(0.55, palette.mid);
    grad.addColorStop(1, palette.outer);

    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.arc(x, y, radius, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.lineWidth = 1.5;
    targetCtx.strokeStyle = palette.stroke;
    targetCtx.stroke();

    targetCtx.fillStyle = palette.text;
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 " + Math.round(radius * 1.02) + "px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(token, 2), x, y + 1);
  }

  function getEnergyTokenPalette(token) {
    var value = String(token || "").trim();
    if (value === "✶" || value === "*" || value === "○") {
      return {
        inner: "#fefefe",
        mid: "#d8d8d8",
        outer: "#8f8f8f",
        stroke: "rgba(40,40,40,0.82)",
        text: "#1d1d1d"
      };
    }
    if (value === "🔥") {
      return {
        inner: "#ffd5b8",
        mid: "#f48c2a",
        outer: "#8f2f0c",
        stroke: "rgba(70,24,9,0.85)",
        text: "#2c1209"
      };
    }
    if (value === "💧") {
      return {
        inner: "#daefff",
        mid: "#58a3f4",
        outer: "#1f4b8e",
        stroke: "rgba(17,41,77,0.86)",
        text: "#0d274f"
      };
    }
    if (value === "🍃" || value === "🌿") {
      return {
        inner: "#e4ffd3",
        mid: "#84c95d",
        outer: "#2f6e29",
        stroke: "rgba(24,54,20,0.86)",
        text: "#173d1a"
      };
    }
    if (value === "🧠" || value === "👁") {
      return {
        inner: "#ffe2ff",
        mid: "#cb7de9",
        outer: "#6f3592",
        stroke: "rgba(52,24,72,0.84)",
        text: "#2a1240"
      };
    }
    return {
      inner: "#fff5b5",
      mid: "#efc528",
      outer: "#8d6e20",
      stroke: "rgba(37,28,8,0.85)",
      text: "#24180a"
    };
  }

  function drawCoverImage(targetCtx, image, x, y, w, h, zoom, offsetX, offsetY) {
    var zoomFactor = zoom / 100;
    var fit = Math.max(w / image.width, h / image.height) * zoomFactor;
    var drawW = image.width * fit;
    var drawH = image.height * fit;
    var shiftX = (offsetX / 180) * (drawW - w) * 0.5;
    var shiftY = (offsetY / 180) * (drawH - h) * 0.5;
    var dx = x + (w - drawW) * 0.5 + shiftX;
    var dy = y + (h - drawH) * 0.5 + shiftY;
    targetCtx.drawImage(image, dx, dy, drawW, drawH);
  }

  function drawReferenceCrop(targetCtx, image, x, y, w, h, zoom, offsetX, offsetY) {
    var srcX = 78;
    var srcY = 128;
    var srcW = 578;
    var srcH = 392;
    var zoomFactor = zoom / 100;
    var cropW = srcW / zoomFactor;
    var cropH = srcH / zoomFactor;
    var maxShiftX = (srcW - cropW) * 0.5;
    var maxShiftY = (srcH - cropH) * 0.5;
    var shiftX = (offsetX / 180) * maxShiftX;
    var shiftY = (offsetY / 180) * maxShiftY;
    var sx = srcX + (srcW - cropW) * 0.5 + shiftX;
    var sy = srcY + (srcH - cropH) * 0.5 + shiftY;

    sx = clamp(sx, 0, image.width - cropW);
    sy = clamp(sy, 0, image.height - cropH);
    targetCtx.drawImage(image, sx, sy, cropW, cropH, x, y, w, h);
  }

  function exportCard(format) {
    var scale = clampInt(state.exportScale, 2, 5, 3);
    var exportCanvas = document.createElement("canvas");
    exportCanvas.width = CARD_WIDTH * scale;
    exportCanvas.height = CARD_HEIGHT * scale;

    var exportCtx = exportCanvas.getContext("2d");
    drawCard(exportCtx, state, scale);

    var mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    var extension = format === "jpg" ? "jpg" : "png";
    var filename = "trading-card-" + Date.now() + "." + extension;
    var quality = format === "jpg" ? 0.95 : undefined;

    exportCanvas.toBlob(
      function (blob) {
        if (!blob) {
          setStatus("Export failed. Use the page through a local web server.", true);
          return;
        }
        downloadBlob(blob, filename);
        setStatus("Exported " + extension.toUpperCase() + " at " + scale + "x.", false);
      },
      mimeType,
      quality
    );
  }

  function readFileAsDataUrl(file, cb) {
    var reader = new FileReader();
    reader.onerror = function () {
      cb(new Error("read failed"));
    };
    reader.onload = function () {
      cb(null, String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  function readFileAsText(file, cb) {
    var reader = new FileReader();
    reader.onerror = function () {
      cb(new Error("read failed"));
    };
    reader.onload = function () {
      cb(null, String(reader.result || ""));
    };
    reader.readAsText(file);
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 200);
  }

  function drawFittedText(targetCtx, text, x, y, maxWidth, maxSize, minSize, weight, family) {
    var clean = String(text || "");
    var size = maxSize;
    var best = minSize;
    while (size >= minSize) {
      targetCtx.font = weight + " " + size + "px " + family;
      if (targetCtx.measureText(clean).width <= maxWidth) {
        best = size;
        break;
      }
      size -= 1;
    }
    targetCtx.font = weight + " " + best + "px " + family;
    targetCtx.fillText(clean, x, y);
  }

  function wrapText(targetCtx, text, x, y, maxWidth, lineHeight, maxLines) {
    var lines = [];
    var paragraphs = String(text || "").split("\n");

    for (var p = 0; p < paragraphs.length; p += 1) {
      var words = paragraphs[p].trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push("");
        continue;
      }

      var line = words[0];
      for (var i = 1; i < words.length; i += 1) {
        var nextLine = line + " " + words[i];
        if (targetCtx.measureText(nextLine).width <= maxWidth) {
          line = nextLine;
        } else {
          lines.push(line);
          line = words[i];
        }
      }
      lines.push(line);
    }

    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[maxLines - 1];
      while (targetCtx.measureText(last + "...").width > maxWidth && last.length > 0) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + "...";
    }

    for (var n = 0; n < lines.length; n += 1) {
      targetCtx.fillText(lines[n], x, y + n * lineHeight);
    }
    return lines.length;
  }

  function tokenizeCost(text) {
    var parts = String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 5);
    if (parts.length === 0) {
      return ["✶"];
    }
    return parts;
  }

  function roundedRect(targetCtx, x, y, w, h, radius) {
    var r = Math.max(0, Math.min(radius, Math.min(w, h) * 0.5));
    targetCtx.beginPath();
    targetCtx.moveTo(x + r, y);
    targetCtx.arcTo(x + w, y, x + w, y + h, r);
    targetCtx.arcTo(x + w, y + h, x, y + h, r);
    targetCtx.arcTo(x, y + h, x, y, r);
    targetCtx.arcTo(x, y, x + w, y, r);
    targetCtx.closePath();
  }

  function getNoisePatternCanvas() {
    if (noisePatternCanvas) {
      return noisePatternCanvas;
    }
    noisePatternCanvas = document.createElement("canvas");
    noisePatternCanvas.width = 120;
    noisePatternCanvas.height = 120;
    var noiseCtx = noisePatternCanvas.getContext("2d");
    var imageData = noiseCtx.createImageData(120, 120);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      var base = randomInt(90, 255);
      var alpha = randomInt(10, 58);
      data[i] = base;
      data[i + 1] = base;
      data[i + 2] = base;
      data[i + 3] = alpha;
    }
    noiseCtx.putImageData(imageData, 0, 0);
    return noisePatternCanvas;
  }

  function saturationScale(value) {
    return clamp(value / 100, 0.3, 1.8);
  }

  function hsl(h, s, l) {
    return "hsl(" + Math.round((h + 360) % 360) + "," + Math.round(s) + "%," + Math.round(l) + "%)";
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function limit(value, maxChars) {
    return String(value || "").slice(0, maxChars);
  }

  function loadStateFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function saveStateToStorage(nextState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      setStatus("Could not save preset. Storage quota may be full.", true);
    }
  }

  function scheduleAutosave() {
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer);
    }
    autosaveTimer = window.setTimeout(function () {
      saveStateToStorage(state);
    }, 350);
  }

  function sanitizeState(raw) {
    var merged = mergeState(DEFAULT_STATE, raw || {});

    merged.stage = String(merged.stage || "").slice(0, 14) || "BASIC";
    merged.name = String(merged.name || "").slice(0, 28) || "Card Name";
    merged.hp = clampInt(merged.hp, 10, 300, 60);
    merged.typeSymbol = String(merged.typeSymbol || "⚡").slice(0, 2) || "⚡";
    merged.cardNumber = String(merged.cardNumber || "").slice(0, 24);
    merged.species = String(merged.species || "").slice(0, 26);
    merged.height = String(merged.height || "").slice(0, 12);
    merged.weight = String(merged.weight || "").slice(0, 14);
    merged.move1.cost = String(merged.move1.cost || "").slice(0, 20);
    merged.move1.name = String(merged.move1.name || "").slice(0, 24);
    merged.move1.text = String(merged.move1.text || "").slice(0, 180);
    merged.move2.cost = String(merged.move2.cost || "").slice(0, 20);
    merged.move2.name = String(merged.move2.name || "").slice(0, 24);
    merged.move2.damage = clampInt(merged.move2.damage, 0, 300, 0);
    merged.move2.text = String(merged.move2.text || "").slice(0, 180);
    merged.weakness = String(merged.weakness || "").slice(0, 18);
    merged.resistance = String(merged.resistance || "").slice(0, 18);
    merged.retreat = String(merged.retreat || "").slice(0, 18);
    merged.flavorText = String(merged.flavorText || "").slice(0, 160);
    merged.illustrator = String(merged.illustrator || "").slice(0, 40);
    merged.collectorNumber = String(merged.collectorNumber || "").slice(0, 12);
    merged.year = String(merged.year || "").slice(0, 6);
    merged.artDataUrl = String(merged.artDataUrl || "");
    merged.art.zoom = clampInt(merged.art.zoom, 80, 180, 100);
    merged.art.offsetX = clampInt(merged.art.offsetX, -180, 180, 0);
    merged.art.offsetY = clampInt(merged.art.offsetY, -180, 180, 0);
    merged.visual.hueShift = clampInt(merged.visual.hueShift, -35, 35, 0);
    merged.visual.saturation = clampInt(merged.visual.saturation, 60, 150, 100);
    merged.visual.texture = clampInt(merged.visual.texture, 0, 100, 38);
    merged.visual.cornerRadius = clampInt(merged.visual.cornerRadius, 20, 56, 36);
    merged.exportScale = clampInt(merged.exportScale, 2, 5, 3);

    return merged;
  }

  function mergeState(base, patch) {
    return {
      stage: pick(patch.stage, base.stage),
      name: pick(patch.name, base.name),
      hp: pick(patch.hp, base.hp),
      typeSymbol: pick(patch.typeSymbol, base.typeSymbol),
      cardNumber: pick(patch.cardNumber, base.cardNumber),
      species: pick(patch.species, base.species),
      height: pick(patch.height, base.height),
      weight: pick(patch.weight, base.weight),
      move1: {
        cost: pick(getPath(patch, "move1.cost"), base.move1.cost),
        name: pick(getPath(patch, "move1.name"), base.move1.name),
        text: pick(getPath(patch, "move1.text"), base.move1.text)
      },
      move2: {
        cost: pick(getPath(patch, "move2.cost"), base.move2.cost),
        name: pick(getPath(patch, "move2.name"), base.move2.name),
        damage: pick(getPath(patch, "move2.damage"), base.move2.damage),
        text: pick(getPath(patch, "move2.text"), base.move2.text)
      },
      weakness: pick(patch.weakness, base.weakness),
      resistance: pick(patch.resistance, base.resistance),
      retreat: pick(patch.retreat, base.retreat),
      flavorText: pick(patch.flavorText, base.flavorText),
      illustrator: pick(patch.illustrator, base.illustrator),
      collectorNumber: pick(patch.collectorNumber, base.collectorNumber),
      year: pick(patch.year, base.year),
      artDataUrl: pick(patch.artDataUrl, base.artDataUrl),
      art: {
        zoom: pick(getPath(patch, "art.zoom"), base.art.zoom),
        offsetX: pick(getPath(patch, "art.offsetX"), base.art.offsetX),
        offsetY: pick(getPath(patch, "art.offsetY"), base.art.offsetY)
      },
      visual: {
        hueShift: pick(getPath(patch, "visual.hueShift"), base.visual.hueShift),
        saturation: pick(getPath(patch, "visual.saturation"), base.visual.saturation),
        texture: pick(getPath(patch, "visual.texture"), base.visual.texture),
        cornerRadius: pick(getPath(patch, "visual.cornerRadius"), base.visual.cornerRadius)
      },
      exportScale: pick(patch.exportScale, base.exportScale)
    };
  }

  function pick(value, fallback) {
    return value === undefined || value === null ? fallback : value;
  }

  function getPath(target, path) {
    var keys = path.split(".");
    var cursor = target;
    for (var i = 0; i < keys.length; i += 1) {
      if (!cursor || typeof cursor !== "object" || !(keys[i] in cursor)) {
        return undefined;
      }
      cursor = cursor[keys[i]];
    }
    return cursor;
  }

  function setPath(target, path, value) {
    var keys = path.split(".");
    var cursor = target;
    for (var i = 0; i < keys.length - 1; i += 1) {
      if (!cursor[keys[i]] || typeof cursor[keys[i]] !== "object") {
        cursor[keys[i]] = {};
      }
      cursor = cursor[keys[i]];
    }
    cursor[keys[keys.length - 1]] = value;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampInt(value, min, max, fallback) {
    var parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return clamp(parsed, min, max);
  }

  function numberOrDefault(value, fallback) {
    var parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function setStatus(message, isError) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.className = "status " + (isError ? "error" : "ok");
    if (statusTimer) {
      window.clearTimeout(statusTimer);
    }
    statusTimer = window.setTimeout(function () {
      statusEl.textContent = "";
      statusEl.className = "status";
    }, STATUS_MS);
  }
})();
