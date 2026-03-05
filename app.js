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
      hueShift: 0,
      saturation: 100,
      texture: 38,
      cornerRadius: 36
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
    targetCtx.globalAlpha = 0.24;
    targetCtx.fillStyle = "#24190a";
    roundedRect(targetCtx, 28, 28, 684, 974, radius + 5);
    targetCtx.fill();
    targetCtx.restore();
  }

  function drawOuterFrame(targetCtx, radius, hue, saturation) {
    var outer = { x: 20, y: 20, w: 694, h: 984 };
    var grad = targetCtx.createLinearGradient(outer.x, outer.y, outer.x, outer.y + outer.h);
    grad.addColorStop(0, hsl(hue + 1, 92 * saturationScale(saturation), 77));
    grad.addColorStop(0.45, hsl(hue, 83 * saturationScale(saturation), 65));
    grad.addColorStop(1, hsl(hue - 1, 88 * saturationScale(saturation), 74));

    targetCtx.fillStyle = grad;
    roundedRect(targetCtx, outer.x, outer.y, outer.w, outer.h, radius);
    targetCtx.fill();

    targetCtx.lineWidth = 3.2;
    targetCtx.strokeStyle = hsl(hue - 2, 70 * saturationScale(saturation), 45);
    roundedRect(targetCtx, outer.x + 1.5, outer.y + 1.5, outer.w - 3, outer.h - 3, radius - 1.5);
    targetCtx.stroke();
  }

  function drawInnerPanel(targetCtx, radius, hue, saturation, texture) {
    var panel = { x: 44, y: 44, w: 646, h: 936 };
    var grad = targetCtx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
    grad.addColorStop(0, hsl(hue + 2, 78 * saturationScale(saturation), 70));
    grad.addColorStop(0.32, hsl(hue, 75 * saturationScale(saturation), 63));
    grad.addColorStop(0.76, hsl(hue - 2, 69 * saturationScale(saturation), 67));
    grad.addColorStop(1, hsl(hue + 1, 75 * saturationScale(saturation), 74));

    targetCtx.fillStyle = grad;
    roundedRect(targetCtx, panel.x, panel.y, panel.w, panel.h, radius);
    targetCtx.fill();

    targetCtx.save();
    roundedRect(targetCtx, panel.x + 2, panel.y + 2, panel.w - 4, panel.h - 4, radius - 2);
    targetCtx.clip();

    targetCtx.globalAlpha = clamp(texture / 100 * 0.55, 0, 0.75);
    targetCtx.fillStyle = targetCtx.createPattern(getNoisePatternCanvas(), "repeat");
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);

    var glow = targetCtx.createRadialGradient(160, 120, 10, 330, 300, 500);
    glow.addColorStop(0, "rgba(255,255,220,0.38)");
    glow.addColorStop(1, "rgba(255,255,220,0)");
    targetCtx.fillStyle = glow;
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);

    targetCtx.restore();

    targetCtx.lineWidth = 1.4;
    targetCtx.strokeStyle = "rgba(255,255,255,0.62)";
    roundedRect(targetCtx, panel.x + 2, panel.y + 2, panel.w - 4, panel.h - 4, radius - 2);
    targetCtx.stroke();
  }

  function drawHeader(targetCtx, drawState) {
    var header = { x: 58, y: 68, w: 618, h: 68 };

    var bar = targetCtx.createLinearGradient(header.x, header.y, header.x + header.w, header.y);
    bar.addColorStop(0, "#8f8f8f");
    bar.addColorStop(0.2, "#f1f1f1");
    bar.addColorStop(0.46, "#b7b7b7");
    bar.addColorStop(0.86, "#ececec");
    bar.addColorStop(1, "#8f8f8f");
    targetCtx.fillStyle = bar;
    roundedRect(targetCtx, header.x, header.y, header.w, header.h, 28);
    targetCtx.fill();

    targetCtx.lineWidth = 2.3;
    targetCtx.strokeStyle = "rgba(56,56,56,0.85)";
    roundedRect(targetCtx, header.x + 1, header.y + 1, header.w - 2, header.h - 2, 27);
    targetCtx.stroke();

    var stagePanel = { x: header.x + 8, y: header.y + 9, w: 144, h: 50 };
    var stageGrad = targetCtx.createLinearGradient(stagePanel.x, stagePanel.y, stagePanel.x + stagePanel.w, stagePanel.y);
    stageGrad.addColorStop(0, "#bfc7ca");
    stageGrad.addColorStop(0.55, "#eff2f3");
    stageGrad.addColorStop(1, "#acb3b6");
    targetCtx.fillStyle = stageGrad;
    roundedRect(targetCtx, stagePanel.x, stagePanel.y, stagePanel.w, stagePanel.h, 15);
    targetCtx.fill();

    targetCtx.fillStyle = "#4f585e";
    targetCtx.font = "700 21px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(limit(drawState.stage, 14), stagePanel.x + 8, stagePanel.y + 25);

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(404, 72);
    targetCtx.quadraticCurveTo(500, 100, 530, 72);
    targetCtx.lineTo(550, 72);
    targetCtx.quadraticCurveTo(502, 136, 387, 136);
    targetCtx.closePath();
    targetCtx.fillStyle = "rgba(255,255,255,0.66)";
    targetCtx.fill();
    targetCtx.restore();

    targetCtx.fillStyle = "#111";
    targetCtx.font = "700 53px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.fillText(limit(drawState.name, 28), 176, 102);

    targetCtx.font = "700 45px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "right";
    targetCtx.fillText("HP " + String(drawState.hp), 618, 100);

    drawTypeToken(targetCtx, 646, 101, limit(drawState.typeSymbol || "⚡", 2), 24);
  }

  function drawArtArea(targetCtx, drawState) {
    var frame = { x: 72, y: 142, w: 590, h: 396 };
    var border = targetCtx.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h);
    border.addColorStop(0, "#6f6f6f");
    border.addColorStop(0.5, "#e3e3e3");
    border.addColorStop(1, "#707070");

    targetCtx.fillStyle = border;
    roundedRect(targetCtx, frame.x, frame.y, frame.w, frame.h, 9);
    targetCtx.fill();

    var inner = { x: frame.x + 11, y: frame.y + 11, w: frame.w - 22, h: frame.h - 22 };
    targetCtx.save();
    roundedRect(targetCtx, inner.x, inner.y, inner.w, inner.h, 5);
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
    haze.addColorStop(0, "rgba(255,255,255,0.22)");
    haze.addColorStop(0.3, "rgba(255,255,255,0)");
    haze.addColorStop(1, "rgba(0,0,0,0.09)");
    targetCtx.fillStyle = haze;
    targetCtx.fillRect(inner.x, inner.y, inner.w, inner.h);
    targetCtx.restore();
  }

  function drawInfoStrip(targetCtx, drawState) {
    var strip = { x: 82, y: 538, w: 570, h: 22 };
    var grad = targetCtx.createLinearGradient(strip.x, strip.y, strip.x + strip.w, strip.y);
    grad.addColorStop(0, "#7f7f7f");
    grad.addColorStop(0.17, "#f0f0f0");
    grad.addColorStop(0.84, "#f0f0f0");
    grad.addColorStop(1, "#7f7f7f");

    targetCtx.fillStyle = grad;
    roundedRect(targetCtx, strip.x, strip.y, strip.w, strip.h, 8);
    targetCtx.fill();

    targetCtx.lineWidth = 1;
    targetCtx.strokeStyle = "rgba(70,70,70,0.85)";
    roundedRect(targetCtx, strip.x + 0.5, strip.y + 0.5, strip.w - 1, strip.h - 1, 7);
    targetCtx.stroke();

    var info = [
      limit(drawState.cardNumber, 24),
      limit(drawState.species, 26),
      "HT: " + limit(drawState.height, 12),
      "WT: " + limit(drawState.weight, 14)
    ].join("  ");

    targetCtx.fillStyle = "#242424";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(info, strip.x + strip.w / 2, strip.y + strip.h / 2 + 0.5);
  }

  function drawAttacks(targetCtx, drawState) {
    drawAttackRow(
      targetCtx,
      {
        y: 602,
        cost: drawState.move1.cost,
        name: drawState.move1.name,
        text: drawState.move1.text,
        damage: ""
      }
    );
    drawAttackRow(
      targetCtx,
      {
        y: 710,
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
    var tokenX = 96;

    for (var i = 0; i < tokens.length; i += 1) {
      drawEnergyToken(targetCtx, tokenX + i * 34, y + 10, tokens[i], 14);
    }

    targetCtx.fillStyle = "#1b1407";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 26px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.fillText(limit(attack.name, 24), 206, y + 18);

    if (attack.damage) {
      targetCtx.textAlign = "right";
      targetCtx.fillText(attack.damage, 644, y + 18);
    }

    targetCtx.textAlign = "left";
    targetCtx.font = "400 14px 'Trebuchet MS', sans-serif";
    wrapText(targetCtx, attack.text, 76, y + 43, 566, 18, 2);
  }

  function drawFooter(targetCtx, drawState) {
    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = "rgba(125,102,36,0.8)";

    targetCtx.beginPath();
    targetCtx.moveTo(76, 848);
    targetCtx.lineTo(355, 848);
    targetCtx.moveTo(76, 904);
    targetCtx.lineTo(355, 904);
    targetCtx.stroke();

    targetCtx.fillStyle = "#3a2d12";
    targetCtx.textAlign = "left";
    targetCtx.font = "700 14px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("weakness", 76, 834);
    targetCtx.fillText("resistance", 196, 834);
    targetCtx.fillText("retreat", 76, 891);

    targetCtx.font = "700 18px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.weakness, 18), 76, 872);
    targetCtx.fillText(limit(drawState.resistance, 18), 196, 872);
    targetCtx.fillText(limit(drawState.retreat, 18), 160, 929);

    drawFlavorRibbon(targetCtx, drawState.flavorText);

    targetCtx.fillStyle = "#1d1406";
    targetCtx.textAlign = "left";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("©" + limit(drawState.year, 6) + " Trading Card Wizard", 74, 960);

    targetCtx.textAlign = "center";
    targetCtx.font = "italic 14px 'Trebuchet MS', sans-serif";
    targetCtx.fillText("Illus. " + limit(drawState.illustrator, 32), 486, 958);

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
    var x = 362;
    var y = 848;
    var w = 292;
    var h = 94;

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(x + 14, y);
    targetCtx.lineTo(x + w - 20, y);
    targetCtx.lineTo(x + w, y + 16);
    targetCtx.lineTo(x + w - 18, y + h);
    targetCtx.lineTo(x, y + h);
    targetCtx.lineTo(x + 16, y + 18);
    targetCtx.closePath();

    var grad = targetCtx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "rgba(254,228,120,0.92)");
    grad.addColorStop(0.55, "rgba(255,239,160,0.82)");
    grad.addColorStop(1, "rgba(235,208,105,0.9)");
    targetCtx.fillStyle = grad;
    targetCtx.fill();

    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = "rgba(128,99,36,0.88)";
    targetCtx.stroke();
    targetCtx.restore();

    targetCtx.fillStyle = "#3a280b";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "top";
    targetCtx.font = "italic 14px 'Trebuchet MS', serif";
    wrapText(targetCtx, text, x + 18, y + 22, w - 46, 15, 3);
  }

  function drawTypeToken(targetCtx, x, y, symbol, radius) {
    drawEnergyToken(targetCtx, x, y, symbol, radius);
  }

  function drawEnergyToken(targetCtx, x, y, token, radius) {
    var grad = targetCtx.createRadialGradient(
      x - radius * 0.2,
      y - radius * 0.35,
      radius * 0.2,
      x,
      y,
      radius
    );
    grad.addColorStop(0, "#fff1a0");
    grad.addColorStop(0.55, "#f0c92a");
    grad.addColorStop(1, "#8d6e20");

    targetCtx.fillStyle = grad;
    targetCtx.beginPath();
    targetCtx.arc(x, y, radius, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.lineWidth = 1.5;
    targetCtx.strokeStyle = "rgba(37,28,8,0.85)";
    targetCtx.stroke();

    targetCtx.fillStyle = "#24180a";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 " + Math.round(radius * 1.08) + "px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(token, 2), x, y + 1);
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
    var srcX = 86;
    var srcY = 126;
    var srcW = 558;
    var srcH = 384;
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
