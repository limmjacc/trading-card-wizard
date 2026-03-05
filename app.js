(function () {
  "use strict";

  var CARD_WIDTH = 734;
  var CARD_HEIGHT = 1024;
  var STORAGE_KEY = "tcw-state-v1";
  var STATUS_MS = 3800;
  var DEFAULT_THEME_ID = "electric";
  var DEFAULT_CARD_TYPE = "pokemon";
  var VALID_CARD_TYPES = ["pokemon", "trainer", "energy"];
  var VALID_TRAINER_CATEGORIES = ["item", "supporter", "stadium", "tool"];
  var VALID_ENERGY_SUBTYPES = ["basic", "special"];

  var THEME_PRESETS = {
    electric: {
      hueShift: 0,
      saturation: 100,
      css: {
        "--bg-1": "#f4e5b4",
        "--bg-2": "#d9c27f",
        "--bg-radial-1": "#fff3c8",
        "--bg-radial-2": "#f2d784",
        "--topbar-border": "#8f7532",
        "--topbar-1": "rgba(255, 251, 226, 0.92)",
        "--topbar-2": "rgba(244, 220, 140, 0.85)",
        "--topbar-stripe": "rgba(190, 156, 66, 0.08)",
        "--panel": "#fff8e2",
        "--panel-edge": "#baa15f",
        "--panel-1": "rgba(255, 250, 230, 0.95)",
        "--panel-2": "rgba(245, 225, 156, 0.85)",
        "--panel-stripe": "rgba(175, 143, 69, 0.08)",
        "--ink": "#2a2111",
        "--accent": "#8f7327",
        "--button": "#f6d85e",
        "--button-edge": "#8d742a",
        "--button-highlight": "#fff2a8",
        "--focus-ring": "rgba(168, 137, 58, 0.18)",
        "--shadow-color": "rgba(71, 53, 16, 0.2)"
      }
    },
    ember: {
      hueShift: -28,
      saturation: 132,
      css: {
        "--bg-1": "#f2d0a5",
        "--bg-2": "#b66149",
        "--bg-radial-1": "#ffe3be",
        "--bg-radial-2": "#ef9d72",
        "--topbar-border": "#8f4a33",
        "--topbar-1": "rgba(255, 234, 219, 0.92)",
        "--topbar-2": "rgba(229, 141, 102, 0.85)",
        "--topbar-stripe": "rgba(179, 86, 52, 0.09)",
        "--panel": "#fff0e6",
        "--panel-edge": "#b56a4d",
        "--panel-1": "rgba(255, 241, 229, 0.95)",
        "--panel-2": "rgba(236, 170, 137, 0.86)",
        "--panel-stripe": "rgba(176, 92, 56, 0.09)",
        "--ink": "#2f1712",
        "--accent": "#8f3a28",
        "--button": "#ef9d5d",
        "--button-edge": "#9d4f2f",
        "--button-highlight": "#ffd0a4",
        "--focus-ring": "rgba(190, 94, 57, 0.22)",
        "--shadow-color": "rgba(77, 32, 19, 0.25)"
      }
    },
    tidal: {
      hueShift: 22,
      saturation: 120,
      css: {
        "--bg-1": "#c7dfef",
        "--bg-2": "#7397be",
        "--bg-radial-1": "#e5f4ff",
        "--bg-radial-2": "#9dc7e9",
        "--topbar-border": "#4f6c8f",
        "--topbar-1": "rgba(232, 244, 255, 0.92)",
        "--topbar-2": "rgba(161, 194, 232, 0.86)",
        "--topbar-stripe": "rgba(77, 121, 173, 0.09)",
        "--panel": "#edf6ff",
        "--panel-edge": "#6d90b5",
        "--panel-1": "rgba(239, 247, 255, 0.95)",
        "--panel-2": "rgba(173, 201, 233, 0.86)",
        "--panel-stripe": "rgba(75, 113, 163, 0.09)",
        "--ink": "#132436",
        "--accent": "#2f567d",
        "--button": "#8cb5df",
        "--button-edge": "#456b95",
        "--button-highlight": "#cbe3ff",
        "--focus-ring": "rgba(68, 111, 165, 0.22)",
        "--shadow-color": "rgba(30, 53, 81, 0.24)"
      }
    },
    grove: {
      hueShift: 12,
      saturation: 118,
      css: {
        "--bg-1": "#d6e7c1",
        "--bg-2": "#7ba06d",
        "--bg-radial-1": "#ecf8d7",
        "--bg-radial-2": "#a6ce86",
        "--topbar-border": "#4f7345",
        "--topbar-1": "rgba(237, 247, 220, 0.92)",
        "--topbar-2": "rgba(169, 207, 141, 0.86)",
        "--topbar-stripe": "rgba(82, 122, 59, 0.09)",
        "--panel": "#f1f8e8",
        "--panel-edge": "#719360",
        "--panel-1": "rgba(242, 250, 234, 0.95)",
        "--panel-2": "rgba(183, 218, 154, 0.86)",
        "--panel-stripe": "rgba(84, 126, 61, 0.09)",
        "--ink": "#182915",
        "--accent": "#385f2f",
        "--button": "#9ccf7f",
        "--button-edge": "#4e7a3f",
        "--button-highlight": "#d5f2bf",
        "--focus-ring": "rgba(80, 124, 61, 0.22)",
        "--shadow-color": "rgba(38, 64, 29, 0.24)"
      }
    },
    violet: {
      hueShift: 30,
      saturation: 128,
      css: {
        "--bg-1": "#ddcfee",
        "--bg-2": "#8e78ba",
        "--bg-radial-1": "#f3e9ff",
        "--bg-radial-2": "#b7a1dc",
        "--topbar-border": "#654f8f",
        "--topbar-1": "rgba(242, 234, 255, 0.92)",
        "--topbar-2": "rgba(185, 164, 227, 0.86)",
        "--topbar-stripe": "rgba(106, 82, 157, 0.09)",
        "--panel": "#f4edff",
        "--panel-edge": "#866eb1",
        "--panel-1": "rgba(246, 239, 255, 0.95)",
        "--panel-2": "rgba(196, 176, 235, 0.86)",
        "--panel-stripe": "rgba(107, 83, 155, 0.09)",
        "--ink": "#1f1733",
        "--accent": "#5e468f",
        "--button": "#b39de2",
        "--button-edge": "#70569e",
        "--button-highlight": "#dccfff",
        "--focus-ring": "rgba(111, 84, 162, 0.22)",
        "--shadow-color": "rgba(56, 41, 88, 0.24)"
      }
    }
  };

  var DEFAULT_PRECISION = {
    headerOffsetX: 0,
    headerOffsetY: 0,
    nameOffsetX: 0,
    nameOffsetY: 0,
    nameSizeAdjust: 0,
    nameTracking: 0,
    hpOffsetX: 0,
    hpOffsetY: 0,
    hpSizeAdjust: 0,
    stageOffsetX: 0,
    stageOffsetY: 0,
    stageSizeAdjust: 0,
    artFrameOffsetY: 0,
    infoStripOffsetY: 0,
    attackOffsetY: 0,
    moveNameSizeAdjust: 0,
    moveTextSizeAdjust: 0,
    moveTextLeadingAdjust: 0,
    footerOffsetY: 0,
    flavorSizeAdjust: 0
  };

  var DEFAULT_STATE = {
    cardType: DEFAULT_CARD_TYPE,
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
    trainer: {
      tag: "TRAINER",
      category: "item",
      effect:
        "Draw 2 cards. If you drew any cards in this way, you may switch your Active Pokemon with 1 of your Benched Pokemon."
    },
    energy: {
      subtype: "basic",
      effect:
        "As long as this card is attached to a Pokemon, it provides 1 Energy of this card's type."
    },
    illustrator: "Kouki Saitou",
    collectorNumber: "115/114",
    year: "2026",
    hpLabel: "HP",
    infoLine: "",
    weaknessLabel: "weakness",
    resistanceLabel: "resistance",
    retreatLabel: "retreat",
    illustratorLabel: "Illus.",
    copyrightText: "©2011 Pokemon",
    setSymbol: "◧",
    artDataUrl: "",
    art: {
      zoom: 100,
      offsetX: 0,
      offsetY: 0
    },
    visual: {
      theme: DEFAULT_THEME_ID,
      hueShift: 0,
      saturation: 100,
      texture: 46,
      cornerRadius: 34
    },
    precision: Object.assign({}, DEFAULT_PRECISION),
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
    trainerTag: "trainer.tag",
    trainerEffect: "trainer.effect",
    energyEffect: "energy.effect",
    illustrator: "illustrator",
    collectorNumber: "collectorNumber",
    yearText: "year",
    hpLabel: "hpLabel",
    infoLine: "infoLine",
    weaknessLabel: "weaknessLabel",
    resistanceLabel: "resistanceLabel",
    retreatLabel: "retreatLabel",
    illustratorLabel: "illustratorLabel",
    copyrightText: "copyrightText",
    setSymbol: "setSymbol"
  };

  var selectMap = {
    trainerCategory: "trainer.category",
    energySubtype: "energy.subtype"
  };

  var rangeMap = {
    artZoom: "art.zoom",
    artOffsetX: "art.offsetX",
    artOffsetY: "art.offsetY",
    hueShift: "visual.hueShift",
    saturation: "visual.saturation",
    texture: "visual.texture",
    cornerRadius: "visual.cornerRadius",
    headerOffsetX: "precision.headerOffsetX",
    headerOffsetY: "precision.headerOffsetY",
    nameOffsetX: "precision.nameOffsetX",
    nameOffsetY: "precision.nameOffsetY",
    nameSizeAdjust: "precision.nameSizeAdjust",
    nameTracking: "precision.nameTracking",
    hpOffsetX: "precision.hpOffsetX",
    hpOffsetY: "precision.hpOffsetY",
    hpSizeAdjust: "precision.hpSizeAdjust",
    stageOffsetX: "precision.stageOffsetX",
    stageOffsetY: "precision.stageOffsetY",
    stageSizeAdjust: "precision.stageSizeAdjust",
    artFrameOffsetY: "precision.artFrameOffsetY",
    infoStripOffsetY: "precision.infoStripOffsetY",
    attackOffsetY: "precision.attackOffsetY",
    moveNameSizeAdjust: "precision.moveNameSizeAdjust",
    moveTextSizeAdjust: "precision.moveTextSizeAdjust",
    moveTextLeadingAdjust: "precision.moveTextLeadingAdjust",
    footerOffsetY: "precision.footerOffsetY",
    flavorSizeAdjust: "precision.flavorSizeAdjust"
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

    Object.keys(selectMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.addEventListener("change", function () {
        setPath(state, selectMap[id], el.value);
        if (id === "trainerCategory") {
          state.trainer.category = sanitizeTrainerCategory(state.trainer.category);
        } else if (id === "energySubtype") {
          state.energy.subtype = sanitizeEnergySubtype(state.energy.subtype);
        }
        scheduleAutosave();
        queueRender();
      });
    });

    var cardType = document.getElementById("cardType");
    if (cardType) {
      cardType.addEventListener("change", function () {
        state.cardType = sanitizeCardType(cardType.value);
        updateCardModeVisibility();
        scheduleAutosave();
        queueRender();
      });
    }

    var exportScale = document.getElementById("exportScale");
    exportScale.addEventListener("change", function () {
      state.exportScale = clampInt(exportScale.value, 2, 5, 3);
      scheduleAutosave();
    });

    var cardTheme = document.getElementById("cardTheme");
    if (cardTheme) {
      cardTheme.addEventListener("change", function () {
        applySelectedTheme(cardTheme.value);
        updateThemeDrivenControlValues();
        scheduleAutosave();
        queueRender();
      });
    }
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
    state.cardType = sanitizeCardType(state.cardType);
    state.trainer.category = sanitizeTrainerCategory(state.trainer.category);
    state.energy.subtype = sanitizeEnergySubtype(state.energy.subtype);
    state.visual.theme = sanitizeThemeId(state.visual.theme);
    applyConfiguratorTheme(state.visual.theme);

    Object.keys(inputMap).forEach(function (id) {
      var path = inputMap[id];
      var el = document.getElementById(id);
      if (!el) {
        return;
      }
      el.value = String(getPath(state, path) || "");
    });

    Object.keys(selectMap).forEach(function (id) {
      var path = selectMap[id];
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

    var cardTheme = document.getElementById("cardTheme");
    if (cardTheme) {
      cardTheme.value = state.visual.theme;
    }

    var cardType = document.getElementById("cardType");
    if (cardType) {
      cardType.value = state.cardType;
    }

    var exportScale = document.getElementById("exportScale");
    exportScale.value = String(state.exportScale);

    updateCardModeVisibility();
  }

  function updateCardModeVisibility() {
    var activeType = sanitizeCardType(state.cardType);
    document.body.setAttribute("data-card-type", activeType);

    var modeEls = document.querySelectorAll("[data-card-modes]");
    for (var i = 0; i < modeEls.length; i += 1) {
      var raw = String(modeEls[i].getAttribute("data-card-modes") || "");
      var modes = raw
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      var isVisible = modes.length === 0 || modes.indexOf(activeType) !== -1;
      modeEls[i].classList.toggle("mode-hidden", !isVisible);
    }
  }

  function setPairValue(rangeId, numberId, value) {
    var rangeEl = document.getElementById(rangeId);
    var numEl = document.getElementById(numberId);
    rangeEl.value = String(value);
    numEl.value = String(value);
  }

  function sanitizeThemeId(themeId) {
    var candidate = String(themeId || "").trim().toLowerCase();
    if (candidate in THEME_PRESETS) {
      return candidate;
    }
    return DEFAULT_THEME_ID;
  }

  function sanitizeCardType(cardType) {
    var candidate = String(cardType || "").trim().toLowerCase();
    if (VALID_CARD_TYPES.indexOf(candidate) !== -1) {
      return candidate;
    }
    return DEFAULT_CARD_TYPE;
  }

  function sanitizeTrainerCategory(category) {
    var candidate = String(category || "").trim().toLowerCase();
    if (VALID_TRAINER_CATEGORIES.indexOf(candidate) !== -1) {
      return candidate;
    }
    return "item";
  }

  function sanitizeEnergySubtype(subtype) {
    var candidate = String(subtype || "").trim().toLowerCase();
    if (VALID_ENERGY_SUBTYPES.indexOf(candidate) !== -1) {
      return candidate;
    }
    return "basic";
  }

  function applySelectedTheme(themeId) {
    var cleanTheme = sanitizeThemeId(themeId);
    var preset = THEME_PRESETS[cleanTheme];
    state.visual.theme = cleanTheme;
    state.visual.hueShift = preset.hueShift;
    state.visual.saturation = preset.saturation;
    applyConfiguratorTheme(cleanTheme);
  }

  function applyConfiguratorTheme(themeId) {
    var cleanTheme = sanitizeThemeId(themeId);
    var preset = THEME_PRESETS[cleanTheme];
    var root = document.documentElement;
    Object.keys(preset.css).forEach(function (varName) {
      root.style.setProperty(varName, preset.css[varName]);
    });
  }

  function updateThemeDrivenControlValues() {
    var hueShift = document.getElementById("hueShift");
    var saturation = document.getElementById("saturation");
    if (hueShift) {
      hueShift.value = String(state.visual.hueShift);
    }
    if (saturation) {
      saturation.value = String(state.visual.saturation);
    }
  }

  function loadDefaultArt() {
    var candidates = ["./images/example-card.jpeg", "./example-card.jpeg"];
    var image = new Image();
    var idx = 0;

    function tryNext() {
      if (idx >= candidates.length) {
        defaultArtImage = null;
        queueRender();
        return;
      }
      image.src = candidates[idx];
      idx += 1;
    }

    image.onload = function () {
      defaultArtImage = image;
      queueRender();
    };
    image.onerror = function () {
      tryNext();
    };

    tryNext();
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
    var cardType = sanitizeCardType(drawState.cardType);

    targetCtx.clearRect(0, 0, CARD_WIDTH * S, CARD_HEIGHT * S);
    targetCtx.save();
    targetCtx.scale(S, S);

    drawShadow(targetCtx, radius);
    drawOuterFrame(targetCtx, radius, hue, saturation);
    drawInnerPanel(targetCtx, radius - 12, hue, saturation, texture);
    if (cardType === "trainer") {
      drawTrainerCard(targetCtx, drawState);
    } else if (cardType === "energy") {
      drawEnergyCard(targetCtx, drawState);
    } else {
      drawPokemonCard(targetCtx, drawState);
    }

    targetCtx.restore();
  }

  function drawPokemonCard(targetCtx, drawState) {
    drawHeader(targetCtx, drawState);
    drawArtArea(targetCtx, drawState);
    drawInfoStrip(targetCtx, drawState);
    drawAttacks(targetCtx, drawState);
    drawFooter(targetCtx, drawState);
  }

  function drawTrainerCard(targetCtx, drawState) {
    drawTrainerHeader(targetCtx, drawState);
    drawArtArea(targetCtx, drawState);
    drawTrainerTextBox(targetCtx, drawState);
    drawMetaFooter(targetCtx, drawState, 958);
  }

  function drawEnergyCard(targetCtx, drawState) {
    drawEnergyHeader(targetCtx, drawState);
    drawEnergyCenterPanel(targetCtx, drawState);
    drawMetaFooter(targetCtx, drawState, 958);
  }

  function drawTrainerHeader(targetCtx, drawState) {
    var headerOffsetX = getPrecisionValue(drawState, "headerOffsetX", -20, 20);
    var headerOffsetY = getPrecisionValue(drawState, "headerOffsetY", -20, 20);
    var nameOffsetX = getPrecisionValue(drawState, "nameOffsetX", -40, 40);
    var nameOffsetY = getPrecisionValue(drawState, "nameOffsetY", -24, 24);
    var nameSizeAdjust = getPrecisionValue(drawState, "nameSizeAdjust", -12, 12);
    var nameTracking = getPrecisionValue(drawState, "nameTracking", -4, 6);
    var header = { x: 42 + headerOffsetX, y: 56 + headerOffsetY, w: 650, h: 74 };
    var title = limit(drawState.name, 28);
    var trainerTag = limit(getPath(drawState, "trainer.tag") || "TRAINER", 16);
    var category = getTrainerCategoryLabel(getPath(drawState, "trainer.category"));

    var bar = targetCtx.createLinearGradient(header.x, header.y, header.x + header.w, header.y);
    bar.addColorStop(0, "#7f848a");
    bar.addColorStop(0.2, "#f6f8fa");
    bar.addColorStop(0.55, "#b6bcc2");
    bar.addColorStop(1, "#7d8288");
    targetCtx.fillStyle = bar;
    roundedRect(targetCtx, header.x, header.y, header.w, header.h, 26);
    targetCtx.fill();

    targetCtx.lineWidth = 2.2;
    targetCtx.strokeStyle = "rgba(51,51,51,0.9)";
    roundedRect(targetCtx, header.x + 1, header.y + 1, header.w - 2, header.h - 2, 25);
    targetCtx.stroke();

    targetCtx.font = "700 20px 'Trebuchet MS', 'Arial Black', sans-serif";
    var tagWidth = clamp(targetCtx.measureText(trainerTag).width + 28, 126, 206);
    var categoryWidth = clamp(targetCtx.measureText(category).width + 30, 130, 214);
    var chipY = header.y + 11;
    var chipH = 52;
    var tagChip = { x: header.x + 10, y: chipY, w: tagWidth, h: chipH };
    var categoryChip = { x: header.x + header.w - categoryWidth - 10, y: chipY, w: categoryWidth, h: chipH };

    var tagGrad = targetCtx.createLinearGradient(tagChip.x, tagChip.y, tagChip.x + tagChip.w, tagChip.y + tagChip.h);
    tagGrad.addColorStop(0, "#d8dde1");
    tagGrad.addColorStop(0.45, "#f4f7f8");
    tagGrad.addColorStop(1, "#adb4ba");
    targetCtx.fillStyle = tagGrad;
    roundedRect(targetCtx, tagChip.x, tagChip.y, tagChip.w, tagChip.h, 14);
    targetCtx.fill();
    targetCtx.strokeStyle = "rgba(73,77,82,0.84)";
    targetCtx.lineWidth = 1.4;
    roundedRect(targetCtx, tagChip.x + 0.5, tagChip.y + 0.5, tagChip.w - 1, tagChip.h - 1, 13.5);
    targetCtx.stroke();

    var categoryGrad = targetCtx.createLinearGradient(
      categoryChip.x,
      categoryChip.y,
      categoryChip.x + categoryChip.w,
      categoryChip.y
    );
    categoryGrad.addColorStop(0, "#f4ce63");
    categoryGrad.addColorStop(0.5, "#f7e28f");
    categoryGrad.addColorStop(1, "#cb9f34");
    targetCtx.fillStyle = categoryGrad;
    roundedRect(targetCtx, categoryChip.x, categoryChip.y, categoryChip.w, categoryChip.h, 14);
    targetCtx.fill();
    targetCtx.strokeStyle = "rgba(95,71,23,0.84)";
    roundedRect(targetCtx, categoryChip.x + 0.5, categoryChip.y + 0.5, categoryChip.w - 1, categoryChip.h - 1, 13.5);
    targetCtx.stroke();

    targetCtx.fillStyle = "#3a3f45";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 20px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.fillText(trainerTag, tagChip.x + tagChip.w * 0.5, tagChip.y + tagChip.h * 0.5 + 1);

    targetCtx.fillStyle = "#4b3912";
    targetCtx.font = "700 20px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.fillText(category, categoryChip.x + categoryChip.w * 0.5, categoryChip.y + categoryChip.h * 0.5 + 1);

    var nameLeft = tagChip.x + tagChip.w + 14;
    var nameRight = categoryChip.x - 14;
    var nameWidth = Math.max(150, nameRight - nameLeft);
    var nameX = nameLeft + nameWidth * 0.5 + nameOffsetX;
    targetCtx.fillStyle = "#141414";
    drawFittedTrackedText(
      targetCtx,
      title,
      nameX,
      header.y + header.h * 0.5 + 1 + nameOffsetY,
      nameWidth,
      48 + nameSizeAdjust,
      24,
      "700",
      "'Trebuchet MS', 'Arial Black', sans-serif",
      nameTracking,
      "center"
    );
  }

  function drawTrainerTextBox(targetCtx, drawState) {
    var infoStripOffsetY = getPrecisionValue(drawState, "infoStripOffsetY", -20, 20);
    var panel = { x: 72, y: 582 + infoStripOffsetY, w: 590, h: 302 };
    var gradient = targetCtx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
    gradient.addColorStop(0, "rgba(248, 242, 222, 0.94)");
    gradient.addColorStop(1, "rgba(230, 214, 166, 0.95)");
    targetCtx.fillStyle = gradient;
    roundedRect(targetCtx, panel.x, panel.y, panel.w, panel.h, 12);
    targetCtx.fill();

    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = "rgba(96,75,30,0.84)";
    roundedRect(targetCtx, panel.x + 0.5, panel.y + 0.5, panel.w - 1, panel.h - 1, 11.5);
    targetCtx.stroke();

    targetCtx.fillStyle = "#4d3a13";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 14px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(getTrainerCategoryLabel(getPath(drawState, "trainer.category")).toUpperCase(), panel.x + 16, panel.y + 22);

    targetCtx.fillStyle = "#1c1407";
    targetCtx.textBaseline = "top";
    targetCtx.font = "400 24px 'Trebuchet MS', sans-serif";
    wrapText(
      targetCtx,
      limit(getPath(drawState, "trainer.effect"), 520),
      panel.x + 16,
      panel.y + 44,
      panel.w - 32,
      30,
      8
    );
  }

  function drawEnergyHeader(targetCtx, drawState) {
    var headerOffsetX = getPrecisionValue(drawState, "headerOffsetX", -20, 20);
    var headerOffsetY = getPrecisionValue(drawState, "headerOffsetY", -20, 20);
    var nameOffsetX = getPrecisionValue(drawState, "nameOffsetX", -40, 40);
    var nameOffsetY = getPrecisionValue(drawState, "nameOffsetY", -24, 24);
    var nameSizeAdjust = getPrecisionValue(drawState, "nameSizeAdjust", -12, 12);
    var nameTracking = getPrecisionValue(drawState, "nameTracking", -4, 6);
    var header = { x: 42 + headerOffsetX, y: 56 + headerOffsetY, w: 650, h: 86 };
    var subtype = getEnergySubtypeLabel(getPath(drawState, "energy.subtype"));
    var symbol = limit(drawState.typeSymbol || "⚡", 2);

    var bar = targetCtx.createLinearGradient(header.x, header.y, header.x + header.w, header.y);
    bar.addColorStop(0, "#8c8f95");
    bar.addColorStop(0.2, "#f1f3f5");
    bar.addColorStop(0.55, "#b5bcc3");
    bar.addColorStop(1, "#868b92");
    targetCtx.fillStyle = bar;
    roundedRect(targetCtx, header.x, header.y, header.w, header.h, 27);
    targetCtx.fill();

    targetCtx.lineWidth = 2.2;
    targetCtx.strokeStyle = "rgba(54,54,54,0.9)";
    roundedRect(targetCtx, header.x + 1, header.y + 1, header.w - 2, header.h - 2, 26);
    targetCtx.stroke();

    targetCtx.fillStyle = "#41464d";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 20px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(subtype, header.x + header.w * 0.5, header.y + 24);

    targetCtx.fillStyle = "#141414";
    drawFittedTrackedText(
      targetCtx,
      limit(drawState.name, 28),
      header.x + header.w * 0.5 + nameOffsetX,
      header.y + 57 + nameOffsetY,
      500,
      49 + nameSizeAdjust,
      26,
      "700",
      "'Trebuchet MS', 'Arial Black', sans-serif",
      nameTracking,
      "center"
    );

    drawTypeToken(targetCtx, header.x + header.w - 33, header.y + 43, symbol, 19);
  }

  function drawEnergyCenterPanel(targetCtx, drawState) {
    var artFrameOffsetY = getPrecisionValue(drawState, "artFrameOffsetY", -30, 30);
    var panel = { x: 86, y: 166 + artFrameOffsetY, w: 562, h: 676 };
    var symbol = limit(drawState.typeSymbol || "⚡", 2);
    var palette = getEnergyTokenPalette(symbol);
    var background = targetCtx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
    background.addColorStop(0, "rgba(253,248,228,0.9)");
    background.addColorStop(1, "rgba(227,209,150,0.93)");
    targetCtx.fillStyle = background;
    roundedRect(targetCtx, panel.x, panel.y, panel.w, panel.h, 13);
    targetCtx.fill();

    targetCtx.lineWidth = 2;
    targetCtx.strokeStyle = "rgba(91,69,24,0.84)";
    roundedRect(targetCtx, panel.x + 0.5, panel.y + 0.5, panel.w - 1, panel.h - 1, 12.5);
    targetCtx.stroke();

    targetCtx.save();
    roundedRect(targetCtx, panel.x + 3, panel.y + 3, panel.w - 6, panel.h - 6, 10);
    targetCtx.clip();

    var rayCenterX = panel.x + panel.w * 0.5;
    var rayCenterY = panel.y + panel.h * 0.41;
    for (var i = 0; i < 18; i += 1) {
      var start = (Math.PI * 2 * i) / 18;
      var end = start + Math.PI / 18;
      targetCtx.beginPath();
      targetCtx.moveTo(rayCenterX, rayCenterY);
      targetCtx.arc(rayCenterX, rayCenterY, panel.w * 0.74, start, end);
      targetCtx.closePath();
      targetCtx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.05)";
      targetCtx.fill();
    }

    var glow = targetCtx.createRadialGradient(rayCenterX, rayCenterY, 46, rayCenterX, rayCenterY, 278);
    glow.addColorStop(0, "rgba(255,255,255,0.56)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    targetCtx.fillStyle = glow;
    targetCtx.fillRect(panel.x, panel.y, panel.w, panel.h);
    targetCtx.restore();

    drawTypeToken(targetCtx, panel.x + panel.w * 0.5, panel.y + panel.h * 0.42, symbol, 112);

    var effectText = String(getPath(drawState, "energy.effect") || "").trim();
    if (!effectText) {
      return;
    }

    var effectPanel = { x: panel.x + 24, y: panel.y + panel.h - 246, w: panel.w - 48, h: 212 };
    var effectGrad = targetCtx.createLinearGradient(effectPanel.x, effectPanel.y, effectPanel.x, effectPanel.y + effectPanel.h);
    effectGrad.addColorStop(0, "rgba(255,255,255,0.9)");
    effectGrad.addColorStop(1, "rgba(245,235,203,0.9)");
    targetCtx.fillStyle = effectGrad;
    roundedRect(targetCtx, effectPanel.x, effectPanel.y, effectPanel.w, effectPanel.h, 9);
    targetCtx.fill();

    targetCtx.strokeStyle = palette.stroke;
    targetCtx.lineWidth = 1.6;
    roundedRect(targetCtx, effectPanel.x + 0.5, effectPanel.y + 0.5, effectPanel.w - 1, effectPanel.h - 1, 8.5);
    targetCtx.stroke();

    targetCtx.fillStyle = "#1e1507";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "top";
    targetCtx.font = "400 24px 'Trebuchet MS', sans-serif";
    wrapText(targetCtx, limit(effectText, 420), effectPanel.x + 14, effectPanel.y + 14, effectPanel.w - 28, 29, 6);
  }

  function drawMetaFooter(targetCtx, drawState, baselineY) {
    var footerOffsetY = getPrecisionValue(drawState, "footerOffsetY", -40, 40);
    var y = baselineY + footerOffsetY;

    targetCtx.lineWidth = 1.8;
    targetCtx.strokeStyle = "rgba(125,102,36,0.72)";
    targetCtx.beginPath();
    targetCtx.moveTo(76, y - 30);
    targetCtx.lineTo(658, y - 30);
    targetCtx.stroke();

    targetCtx.fillStyle = "#1d1406";
    targetCtx.textBaseline = "middle";
    targetCtx.textAlign = "left";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    var copyright = String(drawState.copyrightText || "").trim();
    if (!copyright) {
      copyright = "©" + limit(drawState.year, 6) + " Trading Card Wizard";
    }
    targetCtx.fillText(limit(copyright, 42), 74, y);

    targetCtx.textAlign = "center";
    targetCtx.font = "italic 13px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(
      limit(drawState.illustratorLabel || "Illus.", 12) + " " + limit(drawState.illustrator, 32),
      493,
      y - 1
    );

    targetCtx.textAlign = "right";
    targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.collectorNumber, 12), 644, y - 2);

    if (String(drawState.setSymbol || "").trim()) {
      targetCtx.textAlign = "center";
      targetCtx.textBaseline = "middle";
      targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
      targetCtx.fillStyle = "#1b1811";
      targetCtx.fillText(limit(drawState.setSymbol, 3), 671, y - 12);
    } else {
      targetCtx.fillStyle = "#1b1811";
      targetCtx.fillRect(660, y - 23, 22, 22);
      targetCtx.fillStyle = "#f5f5f5";
      targetCtx.fillRect(663.5, y - 19.5, 6.5, 6.5);
      targetCtx.fillRect(672.5, y - 10.5, 6.5, 6.5);
    }
  }

  function getTrainerCategoryLabel(category) {
    var normalized = sanitizeTrainerCategory(category);
    if (normalized === "supporter") {
      return "Supporter";
    }
    if (normalized === "stadium") {
      return "Stadium";
    }
    if (normalized === "tool") {
      return "Pokemon Tool";
    }
    return "Item";
  }

  function getEnergySubtypeLabel(subtype) {
    var normalized = sanitizeEnergySubtype(subtype);
    if (normalized === "special") {
      return "Special Energy";
    }
    return "Basic Energy";
  }

  function getPrecisionValue(drawState, key, min, max) {
    var raw = getPath(drawState, "precision." + key);
    return clampInt(raw, min, max, 0);
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
    var headerOffsetX = getPrecisionValue(drawState, "headerOffsetX", -20, 20);
    var headerOffsetY = getPrecisionValue(drawState, "headerOffsetY", -20, 20);
    var nameOffsetX = getPrecisionValue(drawState, "nameOffsetX", -40, 40);
    var nameOffsetY = getPrecisionValue(drawState, "nameOffsetY", -24, 24);
    var nameSizeAdjust = getPrecisionValue(drawState, "nameSizeAdjust", -12, 12);
    var nameTracking = getPrecisionValue(drawState, "nameTracking", -4, 6);
    var hpOffsetX = getPrecisionValue(drawState, "hpOffsetX", -24, 24);
    var hpOffsetY = getPrecisionValue(drawState, "hpOffsetY", -24, 24);
    var hpSizeAdjust = getPrecisionValue(drawState, "hpSizeAdjust", -12, 12);
    var stageOffsetX = getPrecisionValue(drawState, "stageOffsetX", -20, 20);
    var stageOffsetY = getPrecisionValue(drawState, "stageOffsetY", -20, 20);
    var stageSizeAdjust = getPrecisionValue(drawState, "stageSizeAdjust", -10, 10);
    var header = { x: 42 + headerOffsetX, y: 56 + headerOffsetY, w: 650, h: 66 };

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

    var underBand = { x: 74 + headerOffsetX, y: 118 + headerOffsetY, w: 592, h: 18 };
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

    var stageFontSize = 19 + stageSizeAdjust;
    var stageText = limit(drawState.stage, 14);
    targetCtx.font = "700 " + stageFontSize + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    var stageTextWidth = targetCtx.measureText(stageText).width;
    var stagePanelWidth = clamp(stageTextWidth + 22, 82, 138);
    var stagePanel = {
      x: header.x + 8 + stageOffsetX,
      y: header.y + 8 + stageOffsetY,
      w: stagePanelWidth,
      h: 50
    };
    var stageGrad = targetCtx.createLinearGradient(stagePanel.x, stagePanel.y, stagePanel.x + stagePanel.w, stagePanel.y);
    stageGrad.addColorStop(0, "#bcc4c7");
    stageGrad.addColorStop(0.55, "#edf0f1");
    stageGrad.addColorStop(1, "#a8afb2");
    targetCtx.fillStyle = stageGrad;
    roundedRect(targetCtx, stagePanel.x, stagePanel.y, stagePanel.w, stagePanel.h, 14);
    targetCtx.fill();

    targetCtx.fillStyle = "#4b5359";
    targetCtx.font = "700 " + stageFontSize + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(stageText, stagePanel.x + 10, stagePanel.y + 26);

    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.moveTo(390 + headerOffsetX, 58 + headerOffsetY);
    targetCtx.quadraticCurveTo(507 + headerOffsetX, 87 + headerOffsetY, 549 + headerOffsetX, 57 + headerOffsetY);
    targetCtx.lineTo(577 + headerOffsetX, 57 + headerOffsetY);
    targetCtx.quadraticCurveTo(515 + headerOffsetX, 122 + headerOffsetY, 371 + headerOffsetX, 123 + headerOffsetY);
    targetCtx.closePath();
    targetCtx.fillStyle = "rgba(255,255,255,0.55)";
    targetCtx.fill();
    targetCtx.restore();

    var symbolRadius = 18;
    var symbolCx = header.x + header.w - 21 + hpOffsetX;
    var symbolCy = header.y + header.h * 0.5 + 0.5 + hpOffsetY;
    var hpRight = symbolCx - symbolRadius - 9;
    var hpLabel = limit(drawState.hpLabel || "HP", 8);
    var hpLabelSize = 24;
    var hpValueSize = 46 + hpSizeAdjust;
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 " + hpLabelSize + "px 'Trebuchet MS', sans-serif";
    var hpLabelWidth = targetCtx.measureText(hpLabel).width;
    targetCtx.font = "700 " + hpValueSize + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    var hpValueWidth = targetCtx.measureText(String(drawState.hp)).width;
    var hpGap = 7;
    var hpTotalWidth = hpLabelWidth + hpGap + hpValueWidth;
    var hpStart = hpRight - hpTotalWidth;
    var hpCenterY = header.y + header.h * 0.5 + 1 + hpOffsetY;

    var nameLeft = stagePanel.x + stagePanel.w + 14;
    var nameRight = hpStart - 10;
    var nameRegionWidth = Math.max(120, nameRight - nameLeft);
    var nameCenterX = nameLeft + nameRegionWidth * 0.5 + nameOffsetX;

    targetCtx.fillStyle = "#141414";
    targetCtx.font = "700 " + (50 + nameSizeAdjust) + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    drawFittedTrackedText(
      targetCtx,
      limit(drawState.name, 28),
      nameCenterX,
      header.y + header.h * 0.5 + 1 + nameOffsetY,
      nameRegionWidth,
      50 + nameSizeAdjust,
      26,
      "700",
      "'Trebuchet MS', 'Arial Black', sans-serif",
      nameTracking,
      "center"
    );

    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 " + hpLabelSize + "px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(hpLabel, hpStart, hpCenterY - 1);
    targetCtx.font = "700 " + hpValueSize + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    targetCtx.fillText(String(drawState.hp), hpStart + hpLabelWidth + hpGap, hpCenterY + 0.5);

    drawTypeToken(targetCtx, symbolCx, symbolCy, limit(drawState.typeSymbol || "⚡", 2), symbolRadius);
  }

  function drawArtArea(targetCtx, drawState) {
    var artFrameOffsetY = getPrecisionValue(drawState, "artFrameOffsetY", -30, 30);
    var frame = { x: 64, y: 138 + artFrameOffsetY, w: 606, h: 412 };
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
    var infoStripOffsetY = getPrecisionValue(drawState, "infoStripOffsetY", -20, 20);
    var strip = { x: 74, y: 553 + infoStripOffsetY, w: 586, h: 22 };
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

    var info = String(drawState.infoLine || "").trim();
    if (!info) {
      info = [
        limit(drawState.cardNumber, 24),
        limit(drawState.species, 26),
        "HT: " + limit(drawState.height, 12),
        "WT: " + limit(drawState.weight, 14)
      ].join("  ");
    }

    targetCtx.fillStyle = "#242424";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(info, strip.x + strip.w / 2, strip.y + strip.h / 2 + 0.3);
  }

  function drawAttacks(targetCtx, drawState) {
    var attackOffsetY = getPrecisionValue(drawState, "attackOffsetY", -40, 40);
    drawAttackRow(
      targetCtx,
      {
        y: 620 + attackOffsetY,
        cost: drawState.move1.cost,
        name: drawState.move1.name,
        text: drawState.move1.text,
        state: drawState,
        damage: ""
      }
    );
    drawAttackRow(
      targetCtx,
      {
        y: 724 + attackOffsetY,
        cost: drawState.move2.cost,
        name: drawState.move2.name,
        text: drawState.move2.text,
        state: drawState,
        damage: drawState.move2.damage > 0 ? String(drawState.move2.damage) : ""
      }
    );
  }

  function drawAttackRow(targetCtx, attack) {
    var y = attack.y;
    var drawState = attack.state || {};
    var moveNameSizeAdjust = getPrecisionValue(drawState, "moveNameSizeAdjust", -10, 10);
    var moveTextSizeAdjust = getPrecisionValue(drawState, "moveTextSizeAdjust", -8, 8);
    var moveTextLeadingAdjust = getPrecisionValue(drawState, "moveTextLeadingAdjust", -8, 8);
    var tokens = tokenizeCost(attack.cost);
    var tokenX = 86;

    for (var i = 0; i < tokens.length; i += 1) {
      drawEnergyToken(targetCtx, tokenX + i * 34, y + 9, tokens[i], 14);
    }

    targetCtx.fillStyle = "#1b1407";
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.font = "700 " + (23 + moveNameSizeAdjust) + "px 'Trebuchet MS', 'Arial Black', sans-serif";
    drawFittedText(
      targetCtx,
      limit(attack.name, 24),
      200,
      y + 14,
      attack.damage ? 360 : 430,
      23 + moveNameSizeAdjust,
      15,
      "700",
      "'Trebuchet MS', 'Arial Black', sans-serif"
    );

    if (attack.damage) {
      targetCtx.textAlign = "right";
      targetCtx.fillText(attack.damage, 650, y + 14);
    }

    targetCtx.textAlign = "left";
    targetCtx.font = "400 " + (16 + moveTextSizeAdjust) + "px 'Comic Sans MS', 'Trebuchet MS', sans-serif";
    wrapText(targetCtx, attack.text, 76, y + 40, 572, 18 + moveTextLeadingAdjust, 2);
  }

  function drawFooter(targetCtx, drawState) {
    var footerOffsetY = getPrecisionValue(drawState, "footerOffsetY", -40, 40);
    targetCtx.lineWidth = 2.1;
    targetCtx.strokeStyle = "rgba(125,102,36,0.72)";

    targetCtx.beginPath();
    targetCtx.moveTo(76, 850 + footerOffsetY);
    targetCtx.lineTo(364, 850 + footerOffsetY);
    targetCtx.moveTo(76, 906 + footerOffsetY);
    targetCtx.lineTo(364, 906 + footerOffsetY);
    targetCtx.stroke();

    targetCtx.fillStyle = "#3a2d12";
    targetCtx.textAlign = "left";
    targetCtx.font = "700 13px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.weaknessLabel || "weakness", 18), 76, 834 + footerOffsetY);
    targetCtx.fillText(limit(drawState.resistanceLabel || "resistance", 18), 194, 834 + footerOffsetY);
    targetCtx.fillText(limit(drawState.retreatLabel || "retreat", 18), 76, 891 + footerOffsetY);

    targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.weakness, 18), 76, 872 + footerOffsetY);
    targetCtx.fillText(limit(drawState.resistance, 18), 194, 872 + footerOffsetY);

    var retreatTokens = tokenizeCost(drawState.retreat).slice(0, 3);
    for (var i = 0; i < retreatTokens.length; i += 1) {
      drawEnergyToken(targetCtx, 126 + i * 26, 927 + footerOffsetY, retreatTokens[i], 10);
    }

    drawFlavorRibbon(targetCtx, drawState.flavorText, drawState, footerOffsetY);

    targetCtx.fillStyle = "#1d1406";
    targetCtx.textAlign = "left";
    targetCtx.font = "400 11px 'Trebuchet MS', sans-serif";
    var copyright = String(drawState.copyrightText || "").trim();
    if (!copyright) {
      copyright = "©" + limit(drawState.year, 6) + " Trading Card Wizard";
    }
    targetCtx.fillText(limit(copyright, 42), 74, 960 + footerOffsetY);

    targetCtx.textAlign = "center";
    targetCtx.font = "italic 13px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.illustratorLabel || "Illus.", 12) + " " + limit(drawState.illustrator, 32), 493, 958 + footerOffsetY);

    targetCtx.textAlign = "right";
    targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
    targetCtx.fillText(limit(drawState.collectorNumber, 12), 644, 956 + footerOffsetY);

    if (String(drawState.setSymbol || "").trim()) {
      targetCtx.textAlign = "center";
      targetCtx.textBaseline = "middle";
      targetCtx.font = "700 19px 'Trebuchet MS', sans-serif";
      targetCtx.fillStyle = "#1b1811";
      targetCtx.fillText(limit(drawState.setSymbol, 3), 671, 946 + footerOffsetY);
    } else {
      targetCtx.fillStyle = "#1b1811";
      targetCtx.fillRect(660, 935 + footerOffsetY, 22, 22);
      targetCtx.fillStyle = "#f5f5f5";
      targetCtx.fillRect(663.5, 938.5 + footerOffsetY, 6.5, 6.5);
      targetCtx.fillRect(672.5, 947.5 + footerOffsetY, 6.5, 6.5);
    }
  }

  function drawFlavorRibbon(targetCtx, text, drawState, footerOffsetY) {
    var flavorSizeAdjust = getPrecisionValue(drawState || {}, "flavorSizeAdjust", -8, 8);
    var x = 366;
    var y = 850 + (footerOffsetY || 0);
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
    targetCtx.font = "italic " + (15 + flavorSizeAdjust) + "px 'Comic Sans MS', 'Trebuchet MS', serif";
    wrapText(targetCtx, text, x + 15, y + 16, w - 32, 15 + Math.round(flavorSizeAdjust / 2), 3);
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

  function drawFittedTrackedText(targetCtx, text, x, y, maxWidth, maxSize, minSize, weight, family, tracking, align) {
    var clean = String(text || "");
    var size = maxSize;
    var best = minSize;
    while (size >= minSize) {
      targetCtx.font = weight + " " + size + "px " + family;
      if (measureTrackedText(targetCtx, clean, tracking) <= maxWidth) {
        best = size;
        break;
      }
      size -= 1;
    }
    targetCtx.font = weight + " " + best + "px " + family;
    drawTrackedText(targetCtx, clean, x, y, tracking, align || "left");
  }

  function measureTrackedText(targetCtx, text, tracking) {
    var chars = Array.from(String(text || ""));
    if (!chars.length) {
      return 0;
    }
    var width = 0;
    for (var i = 0; i < chars.length; i += 1) {
      width += targetCtx.measureText(chars[i]).width;
    }
    return width + tracking * (chars.length - 1);
  }

  function drawTrackedText(targetCtx, text, x, y, tracking, align) {
    var chars = Array.from(String(text || ""));
    if (!chars.length) {
      return;
    }
    if (!tracking) {
      targetCtx.fillText(chars.join(""), x, y);
      return;
    }
    var width = measureTrackedText(targetCtx, chars.join(""), tracking);
    var cursorX = x;
    if (align === "center") {
      cursorX -= width / 2;
    } else if (align === "right") {
      cursorX -= width;
    }
    for (var i = 0; i < chars.length; i += 1) {
      targetCtx.fillText(chars[i], cursorX, y);
      cursorX += targetCtx.measureText(chars[i]).width + tracking;
    }
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

    merged.cardType = sanitizeCardType(merged.cardType);
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
    merged.trainer.tag = String(merged.trainer.tag || "").slice(0, 16) || "TRAINER";
    merged.trainer.category = sanitizeTrainerCategory(merged.trainer.category);
    merged.trainer.effect = String(merged.trainer.effect || "").slice(0, 520);
    merged.energy.subtype = sanitizeEnergySubtype(merged.energy.subtype);
    merged.energy.effect = String(merged.energy.effect || "").slice(0, 420);
    merged.illustrator = String(merged.illustrator || "").slice(0, 40);
    merged.collectorNumber = String(merged.collectorNumber || "").slice(0, 12);
    merged.year = String(merged.year || "").slice(0, 6);
    merged.hpLabel = String(merged.hpLabel || "").slice(0, 8) || "HP";
    merged.infoLine = String(merged.infoLine || "").slice(0, 120);
    merged.weaknessLabel = String(merged.weaknessLabel || "").slice(0, 18) || "weakness";
    merged.resistanceLabel = String(merged.resistanceLabel || "").slice(0, 18) || "resistance";
    merged.retreatLabel = String(merged.retreatLabel || "").slice(0, 18) || "retreat";
    merged.illustratorLabel = String(merged.illustratorLabel || "").slice(0, 12) || "Illus.";
    merged.copyrightText = String(merged.copyrightText || "").slice(0, 42);
    merged.setSymbol = String(merged.setSymbol || "").slice(0, 3);
    merged.artDataUrl = String(merged.artDataUrl || "");
    merged.art.zoom = clampInt(merged.art.zoom, 80, 180, 100);
    merged.art.offsetX = clampInt(merged.art.offsetX, -180, 180, 0);
    merged.art.offsetY = clampInt(merged.art.offsetY, -180, 180, 0);
    merged.visual.theme = sanitizeThemeId(merged.visual.theme);
    merged.visual.hueShift = clampInt(merged.visual.hueShift, -35, 35, 0);
    merged.visual.saturation = clampInt(merged.visual.saturation, 60, 150, 100);
    merged.visual.texture = clampInt(merged.visual.texture, 0, 100, 38);
    merged.visual.cornerRadius = clampInt(merged.visual.cornerRadius, 20, 56, 36);
    merged.precision = Object.assign({}, DEFAULT_PRECISION, merged.precision || {});
    merged.precision.headerOffsetX = clampInt(merged.precision.headerOffsetX, -20, 20, 0);
    merged.precision.headerOffsetY = clampInt(merged.precision.headerOffsetY, -20, 20, 0);
    merged.precision.nameOffsetX = clampInt(merged.precision.nameOffsetX, -40, 40, 0);
    merged.precision.nameOffsetY = clampInt(merged.precision.nameOffsetY, -24, 24, 0);
    merged.precision.nameSizeAdjust = clampInt(merged.precision.nameSizeAdjust, -12, 12, 0);
    merged.precision.nameTracking = clampInt(merged.precision.nameTracking, -4, 6, 0);
    merged.precision.hpOffsetX = clampInt(merged.precision.hpOffsetX, -24, 24, 0);
    merged.precision.hpOffsetY = clampInt(merged.precision.hpOffsetY, -24, 24, 0);
    merged.precision.hpSizeAdjust = clampInt(merged.precision.hpSizeAdjust, -12, 12, 0);
    merged.precision.stageOffsetX = clampInt(merged.precision.stageOffsetX, -20, 20, 0);
    merged.precision.stageOffsetY = clampInt(merged.precision.stageOffsetY, -20, 20, 0);
    merged.precision.stageSizeAdjust = clampInt(merged.precision.stageSizeAdjust, -10, 10, 0);
    merged.precision.artFrameOffsetY = clampInt(merged.precision.artFrameOffsetY, -30, 30, 0);
    merged.precision.infoStripOffsetY = clampInt(merged.precision.infoStripOffsetY, -20, 20, 0);
    merged.precision.attackOffsetY = clampInt(merged.precision.attackOffsetY, -40, 40, 0);
    merged.precision.moveNameSizeAdjust = clampInt(merged.precision.moveNameSizeAdjust, -10, 10, 0);
    merged.precision.moveTextSizeAdjust = clampInt(merged.precision.moveTextSizeAdjust, -8, 8, 0);
    merged.precision.moveTextLeadingAdjust = clampInt(merged.precision.moveTextLeadingAdjust, -8, 8, 0);
    merged.precision.footerOffsetY = clampInt(merged.precision.footerOffsetY, -40, 40, 0);
    merged.precision.flavorSizeAdjust = clampInt(merged.precision.flavorSizeAdjust, -8, 8, 0);
    merged.exportScale = clampInt(merged.exportScale, 2, 5, 3);

    return merged;
  }

  function mergeState(base, patch) {
    return {
      cardType: pick(patch.cardType, base.cardType),
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
      trainer: {
        tag: pick(getPath(patch, "trainer.tag"), base.trainer.tag),
        category: pick(getPath(patch, "trainer.category"), base.trainer.category),
        effect: pick(getPath(patch, "trainer.effect"), base.trainer.effect)
      },
      energy: {
        subtype: pick(getPath(patch, "energy.subtype"), base.energy.subtype),
        effect: pick(getPath(patch, "energy.effect"), base.energy.effect)
      },
      illustrator: pick(patch.illustrator, base.illustrator),
      collectorNumber: pick(patch.collectorNumber, base.collectorNumber),
      year: pick(patch.year, base.year),
      hpLabel: pick(patch.hpLabel, base.hpLabel),
      infoLine: pick(patch.infoLine, base.infoLine),
      weaknessLabel: pick(patch.weaknessLabel, base.weaknessLabel),
      resistanceLabel: pick(patch.resistanceLabel, base.resistanceLabel),
      retreatLabel: pick(patch.retreatLabel, base.retreatLabel),
      illustratorLabel: pick(patch.illustratorLabel, base.illustratorLabel),
      copyrightText: pick(patch.copyrightText, base.copyrightText),
      setSymbol: pick(patch.setSymbol, base.setSymbol),
      artDataUrl: pick(patch.artDataUrl, base.artDataUrl),
      art: {
        zoom: pick(getPath(patch, "art.zoom"), base.art.zoom),
        offsetX: pick(getPath(patch, "art.offsetX"), base.art.offsetX),
        offsetY: pick(getPath(patch, "art.offsetY"), base.art.offsetY)
      },
      visual: {
        theme: pick(getPath(patch, "visual.theme"), base.visual.theme),
        hueShift: pick(getPath(patch, "visual.hueShift"), base.visual.hueShift),
        saturation: pick(getPath(patch, "visual.saturation"), base.visual.saturation),
        texture: pick(getPath(patch, "visual.texture"), base.visual.texture),
        cornerRadius: pick(getPath(patch, "visual.cornerRadius"), base.visual.cornerRadius)
      },
      precision: {
        headerOffsetX: pick(getPath(patch, "precision.headerOffsetX"), base.precision.headerOffsetX),
        headerOffsetY: pick(getPath(patch, "precision.headerOffsetY"), base.precision.headerOffsetY),
        nameOffsetX: pick(getPath(patch, "precision.nameOffsetX"), base.precision.nameOffsetX),
        nameOffsetY: pick(getPath(patch, "precision.nameOffsetY"), base.precision.nameOffsetY),
        nameSizeAdjust: pick(getPath(patch, "precision.nameSizeAdjust"), base.precision.nameSizeAdjust),
        nameTracking: pick(getPath(patch, "precision.nameTracking"), base.precision.nameTracking),
        hpOffsetX: pick(getPath(patch, "precision.hpOffsetX"), base.precision.hpOffsetX),
        hpOffsetY: pick(getPath(patch, "precision.hpOffsetY"), base.precision.hpOffsetY),
        hpSizeAdjust: pick(getPath(patch, "precision.hpSizeAdjust"), base.precision.hpSizeAdjust),
        stageOffsetX: pick(getPath(patch, "precision.stageOffsetX"), base.precision.stageOffsetX),
        stageOffsetY: pick(getPath(patch, "precision.stageOffsetY"), base.precision.stageOffsetY),
        stageSizeAdjust: pick(getPath(patch, "precision.stageSizeAdjust"), base.precision.stageSizeAdjust),
        artFrameOffsetY: pick(getPath(patch, "precision.artFrameOffsetY"), base.precision.artFrameOffsetY),
        infoStripOffsetY: pick(getPath(patch, "precision.infoStripOffsetY"), base.precision.infoStripOffsetY),
        attackOffsetY: pick(getPath(patch, "precision.attackOffsetY"), base.precision.attackOffsetY),
        moveNameSizeAdjust: pick(getPath(patch, "precision.moveNameSizeAdjust"), base.precision.moveNameSizeAdjust),
        moveTextSizeAdjust: pick(getPath(patch, "precision.moveTextSizeAdjust"), base.precision.moveTextSizeAdjust),
        moveTextLeadingAdjust: pick(getPath(patch, "precision.moveTextLeadingAdjust"), base.precision.moveTextLeadingAdjust),
        footerOffsetY: pick(getPath(patch, "precision.footerOffsetY"), base.precision.footerOffsetY),
        flavorSizeAdjust: pick(getPath(patch, "precision.flavorSizeAdjust"), base.precision.flavorSizeAdjust)
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
