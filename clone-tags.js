// a bunch of the blocks here wont work but i do not care

(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Tagged Clones must run unsandboxed');
  }

  const runtime = Scratch.vm.runtime;

  // Map: target.id -> tag string
  const cloneTags = new Map();

  // Helper: get all live clones with a given tag
  function getClonesWithTag(tag) {
    tag = String(tag).trim();
    const results = [];
    for (const target of runtime.targets) {
      if (target.isOriginal) continue;
      if (cloneTags.get(target.id) === tag) {
        results.push(target);
      }
    }
    return results;
  }

  // Helper: get the executing target
  function getSelf(util) {
    return util.target;
  }

  // Clean up tags when a clone is destroyed
  runtime.on('targetWasRemoved', (target) => {
    cloneTags.delete(target.id);
  });

  class TaggedClonesExtension {
    getInfo() {
      return {
        id: 'taggedClones',
        name: 'Tagged Clones',
        color1: '#FF6680',
        color2: '#FF3355',
        color3: '#CC0033',
        blocks: [
          // ── CREATION ────────────────────────────────────────
          {
            opcode: 'createCloneWithTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create clone of [TARGET] with tag [TAG]',
            arguments: {
              TARGET: { type: Scratch.ArgumentType.STRING, defaultValue: 'myself' },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'setMyTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set my clone tag to [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'addTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'add tag [TAG] to this clone',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'b' }
            }
          },
          {
            opcode: 'removeMyTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'remove my clone tag',
          },
          '---',
          // ── MY INFO ─────────────────────────────────────────
          {
            opcode: 'getMyTag',
            blockType: Scratch.BlockType.REPORTER,
            text: 'my clone tag',
          },
          {
            opcode: 'amITagged',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'I have tag [TAG]?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'amIAClone',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'I am a clone?',
          },
          '---',
          // ── TOUCHING ────────────────────────────────────────
          {
            opcode: 'touchingCloneWithTag',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'touching clone with tag [TAG]?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'touchingAnyTaggedClone',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'touching any tagged clone?',
          },
          {
            opcode: 'cloneWithTagTouchingSprite',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'clone with tag [TAG] touching sprite [SPRITE]?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
            }
          },
          {
            opcode: 'cloneWithTagTouchingEdge',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'clone with tag [TAG] touching edge?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'cloneWithTagTouchingMouse',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'clone with tag [TAG] touching mouse cursor?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'cloneWithTagTouchingColor',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'clone with tag [TAG] touching color [COLOR]?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              COLOR: { type: Scratch.ArgumentType.COLOR }
            }
          },
          '---',
          // ── COUNTING & INFO ──────────────────────────────────
          {
            opcode: 'countClonesWithTag',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of clones with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'totalTaggedClones',
            blockType: Scratch.BlockType.REPORTER,
            text: 'total tagged clones',
          },
          {
            opcode: 'totalClones',
            blockType: Scratch.BlockType.REPORTER,
            text: 'total clones (all)',
          },
          {
            opcode: 'getAllTags',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all active tags (JSON list)',
          },
          {
            opcode: 'tagExists',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'any clone has tag [TAG]?',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          '---',
          // ── POSITION & GEOMETRY ──────────────────────────────
          {
            opcode: 'getCloneX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'x of [NTH] clone with tag [TAG]',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'getCloneY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'y of [NTH] clone with tag [TAG]',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'getCloneDirection',
            blockType: Scratch.BlockType.REPORTER,
            text: 'direction of [NTH] clone with tag [TAG]',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'getCloneSize',
            blockType: Scratch.BlockType.REPORTER,
            text: 'size of [NTH] clone with tag [TAG]',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'distanceToNearestTagged',
            blockType: Scratch.BlockType.REPORTER,
            text: 'distance to nearest clone with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'nearestCloneX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'x of nearest clone with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'nearestCloneY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'y of nearest clone with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          '---',
          // ── CONTROL ─────────────────────────────────────────
          {
            opcode: 'deleteAllClonesWithTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete all clones with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'deleteNthCloneWithTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'delete [NTH] clone with tag [TAG]',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'showClonesWithTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'show all clones with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'hideClonesWithTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'hide all clones with tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'renameTag',
            blockType: Scratch.BlockType.COMMAND,
            text: 'rename tag [OLD] to [NEW]',
            arguments: {
              OLD: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              NEW: { type: Scratch.ArgumentType.STRING, defaultValue: 'b' }
            }
          },
          '---',
          // ── MOVEMENT ON TAGGED ────────────────────────────────
          {
            opcode: 'moveTaggedToXY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'move all clones with tag [TAG] to x: [X] y: [Y]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'changeTaggedX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change x of all clones with tag [TAG] by [DX]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              DX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'changeTaggedY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change y of all clones with tag [TAG] by [DY]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              DY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          {
            opcode: 'setTaggedSize',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set size of all clones with tag [TAG] to [SIZE] %',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' },
              SIZE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          '---',
          // ── VARIABLES ON TAGGED ───────────────────────────────
          {
            opcode: 'setVarOnTagged',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set variable [VAR] to [VAL] on all clones with tag [TAG]',
            arguments: {
              VAR: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' },
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'changeVarOnTagged',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change variable [VAR] by [VAL] on all clones with tag [TAG]',
            arguments: {
              VAR: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' },
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'getVarOfNthClone',
            blockType: Scratch.BlockType.REPORTER,
            text: 'variable [VAR] of [NTH] clone with tag [TAG]',
            arguments: {
              VAR: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' },
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          '---',
          // ── LOOP / ITERATION ──────────────────────────────────
          {
            opcode: 'indexOfCurrentClone',
            blockType: Scratch.BlockType.REPORTER,
            text: 'index of this clone among tag [TAG]',
            arguments: {
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
          {
            opcode: 'isNthCloneWithTag',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'I am the [NTH] clone with tag [TAG]?',
            arguments: {
              NTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'a' }
            }
          },
        ]
      };
    }

    // ── CREATION ────────────────────────────────────────────────

    createCloneWithTag({ TARGET, TAG }, util) {
      const tag = String(TAG).trim();
      let targetSprite;
      if (String(TARGET).toLowerCase() === 'myself') {
        targetSprite = util.target.isOriginal ? util.target : runtime.getSpriteTargetByName(util.target.sprite.name);
      } else {
        targetSprite = runtime.getSpriteTargetByName(String(TARGET));
      }
      if (!targetSprite) return;
      const clone = targetSprite.makeClone(false);
      if (clone) {
        cloneTags.set(clone.id, tag);
        runtime.targets.push(clone);
        runtime.fireTargetWasCreated(clone, targetSprite);
      }
    }

    setMyTag({ TAG }, util) {
      cloneTags.set(util.target.id, String(TAG).trim());
    }

    addTag({ TAG }, util) {
      // Appends with comma if already has tag
      const existing = cloneTags.get(util.target.id);
      const newTag = String(TAG).trim();
      if (existing) {
        cloneTags.set(util.target.id, existing + ',' + newTag);
      } else {
        cloneTags.set(util.target.id, newTag);
      }
    }

    removeMyTag({}, util) {
      cloneTags.delete(util.target.id);
    }

    // ── MY INFO ──────────────────────────────────────────────────

    getMyTag({}, util) {
      return cloneTags.get(util.target.id) || '';
    }

    amITagged({ TAG }, util) {
      const myTags = (cloneTags.get(util.target.id) || '').split(',').map(t => t.trim());
      return myTags.includes(String(TAG).trim());
    }

    amIAClone({}, util) {
      return !util.target.isOriginal;
    }

    // ── TOUCHING ─────────────────────────────────────────────────

    touchingCloneWithTag({ TAG }, util) {
      const clones = getClonesWithTag(TAG);
      const renderer = runtime.renderer;
      if (!renderer) return false;
      const selfDrawable = util.target.drawableID;
      for (const clone of clones) {
        if (clone.id === util.target.id) continue;
        const cloneDrawable = clone.drawableID;
        if (cloneDrawable == null) continue;
        if (renderer.isTouchingDrawables(selfDrawable, [cloneDrawable])) return true;
      }
      return false;
    }

    touchingAnyTaggedClone({}, util) {
      const renderer = runtime.renderer;
      if (!renderer) return false;
      const selfDrawable = util.target.drawableID;
      for (const target of runtime.targets) {
        if (target.isOriginal) continue;
        if (target.id === util.target.id) continue;
        if (!cloneTags.has(target.id)) continue;
        const cloneDrawable = target.drawableID;
        if (cloneDrawable == null) continue;
        if (renderer.isTouchingDrawables(selfDrawable, [cloneDrawable])) return true;
      }
      return false;
    }

    cloneWithTagTouchingSprite({ TAG, SPRITE }) {
      const renderer = runtime.renderer;
      if (!renderer) return false;
      const clones = getClonesWithTag(TAG);
      // Collect all drawableIDs belonging to the target sprite (original + its clones)
      const spriteDrawables = runtime.targets
        .filter(t => t.sprite.name === String(SPRITE))
        .map(t => t.drawableID)
        .filter(id => id != null);
      for (const clone of clones) {
        if (clone.drawableID == null) continue;
        if (renderer.isTouchingDrawables(clone.drawableID, spriteDrawables)) return true;
      }
      return false;
    }

    cloneWithTagTouchingEdge({ TAG }) {
      const clones = getClonesWithTag(TAG);
      const stage = runtime.getTargetForStage();
      const stageW = stage ? stage.drawable?.skin?.size?.[0] || 480 : 480;
      const stageH = stage ? stage.drawable?.skin?.size?.[1] || 360 : 360;
      for (const clone of clones) {
        const x = clone.x, y = clone.y;
        if (Math.abs(x) >= stageW / 2 || Math.abs(y) >= stageH / 2) return true;
        if (clone.isTouchingEdge && clone.isTouchingEdge()) return true;
      }
      return false;
    }

    cloneWithTagTouchingMouse({ TAG }) {
      const clones = getClonesWithTag(TAG);
      const mx = runtime.ioDevices.mouse.getScratchX();
      const my = runtime.ioDevices.mouse.getScratchY();
      for (const clone of clones) {
        if (clone.isTouchingPoint(mx, my)) return true;
      }
      return false;
    }

    cloneWithTagTouchingColor({ TAG, COLOR }) {
      const clones = getClonesWithTag(TAG);
      for (const clone of clones) {
        if (clone.isTouchingColor(COLOR)) return true;
      }
      return false;
    }

    // ── COUNTING & INFO ───────────────────────────────────────────

    countClonesWithTag({ TAG }) {
      return getClonesWithTag(TAG).length;
    }

    totalTaggedClones() {
      let count = 0;
      for (const target of runtime.targets) {
        if (!target.isOriginal && cloneTags.has(target.id)) count++;
      }
      return count;
    }

    totalClones() {
      return runtime.targets.filter(t => !t.isOriginal).length;
    }

    getAllTags() {
      const tags = new Set();
      for (const val of cloneTags.values()) {
        val.split(',').forEach(t => tags.add(t.trim()));
      }
      return JSON.stringify([...tags]);
    }

    tagExists({ TAG }) {
      return getClonesWithTag(TAG).length > 0;
    }

    // ── POSITION & GEOMETRY ───────────────────────────────────────

    _nthClone(TAG, NTH) {
      const clones = getClonesWithTag(TAG);
      const idx = Math.round(Number(NTH)) - 1;
      return clones[idx] || null;
    }

    getCloneX({ NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      return c ? c.x : 0;
    }

    getCloneY({ NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      return c ? c.y : 0;
    }

    getCloneDirection({ NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      return c ? c.direction : 90;
    }

    getCloneSize({ NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      return c ? c.size : 100;
    }

    distanceToNearestTagged({ TAG }, util) {
      const clones = getClonesWithTag(TAG);
      let best = Infinity;
      const sx = util.target.x, sy = util.target.y;
      for (const c of clones) {
        if (c.id === util.target.id) continue;
        const d = Math.hypot(c.x - sx, c.y - sy);
        if (d < best) best = d;
      }
      return best === Infinity ? 0 : best;
    }

    nearestCloneX({ TAG }, util) {
      const clones = getClonesWithTag(TAG);
      let best = Infinity, bx = 0;
      const sx = util.target.x, sy = util.target.y;
      for (const c of clones) {
        if (c.id === util.target.id) continue;
        const d = Math.hypot(c.x - sx, c.y - sy);
        if (d < best) { best = d; bx = c.x; }
      }
      return bx;
    }

    nearestCloneY({ TAG }, util) {
      const clones = getClonesWithTag(TAG);
      let best = Infinity, by = 0;
      const sx = util.target.x, sy = util.target.y;
      for (const c of clones) {
        if (c.id === util.target.id) continue;
        const d = Math.hypot(c.x - sx, c.y - sy);
        if (d < best) { best = d; by = c.y; }
      }
      return by;
    }

    // ── CONTROL ───────────────────────────────────────────────────

    deleteAllClonesWithTag({ TAG }) {
      const clones = getClonesWithTag(TAG);
      for (const c of clones) {
        c.dispose();
        runtime.stopForTarget(c);
        runtime.disposeTarget(c);
      }
    }

    deleteNthCloneWithTag({ NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      if (c) {
        c.dispose();
        runtime.stopForTarget(c);
        runtime.disposeTarget(c);
      }
    }

    showClonesWithTag({ TAG }) {
      for (const c of getClonesWithTag(TAG)) c.setVisible(true);
    }

    hideClonesWithTag({ TAG }) {
      for (const c of getClonesWithTag(TAG)) c.setVisible(false);
    }

    renameTag({ OLD, NEW }) {
      const o = String(OLD).trim(), n = String(NEW).trim();
      for (const [id, tag] of cloneTags.entries()) {
        if (tag === o) cloneTags.set(id, n);
      }
    }

    // ── MOVEMENT ──────────────────────────────────────────────────

    moveTaggedToXY({ TAG, X, Y }) {
      for (const c of getClonesWithTag(TAG)) c.setXY(Number(X), Number(Y));
    }

    changeTaggedX({ TAG, DX }) {
      for (const c of getClonesWithTag(TAG)) c.setXY(c.x + Number(DX), c.y);
    }

    changeTaggedY({ TAG, DY }) {
      for (const c of getClonesWithTag(TAG)) c.setXY(c.x, c.y + Number(DY));
    }

    setTaggedSize({ TAG, SIZE }) {
      for (const c of getClonesWithTag(TAG)) c.setSize(Number(SIZE));
    }

    // ── VARIABLES ─────────────────────────────────────────────────

    setVarOnTagged({ VAR, VAL, TAG }) {
      const varName = String(VAR);
      for (const c of getClonesWithTag(TAG)) {
        const v = c.lookupVariableByNameAndType(varName, '');
        if (v) v.value = Number(VAL);
      }
    }

    changeVarOnTagged({ VAR, VAL, TAG }) {
      const varName = String(VAR);
      for (const c of getClonesWithTag(TAG)) {
        const v = c.lookupVariableByNameAndType(varName, '');
        if (v) v.value = Number(v.value) + Number(VAL);
      }
    }

    getVarOfNthClone({ VAR, NTH, TAG }) {
      const c = this._nthClone(TAG, NTH);
      if (!c) return 0;
      const v = c.lookupVariableByNameAndType(String(VAR), '');
      return v ? v.value : 0;
    }

    // ── LOOP / ITERATION ──────────────────────────────────────────

    indexOfCurrentClone({ TAG }, util) {
      const clones = getClonesWithTag(TAG);
      return clones.findIndex(c => c.id === util.target.id) + 1;
    }

    isNthCloneWithTag({ NTH, TAG }, util) {
      const clones = getClonesWithTag(TAG);
      const idx = Math.round(Number(NTH)) - 1;
      return clones[idx]?.id === util.target.id;
    }
  }

  Scratch.extensions.register(new TaggedClonesExtension());
})(Scratch);