/* global MockL10n */
'use strict';

require('/shared/test/unit/mocks/mock_l10n.js');

suite('SimPinDialog > ', function() {

  var simPinDialog;
  var mockSettingsUtils;

  var modules = [
    'panels/simpin_dialog/simpin_dialog',
    'unit/mock_settings_utils'
  ];

  var map = {
    '*': {
      'modules/settings_utils': 'unit/mock_settings_utils'
    }
  };
  
  setup(function(done) {
    window.navigator.mozL10n = MockL10n;

    var requireCtx = testRequire([], map, function() {});
    requireCtx(modules, function(SimPinDialog, MockSettingsUtils) {
      mockSettingsUtils = MockSettingsUtils;

      simPinDialog = new SimPinDialog({
        pinInput: createInput(),
        pukInput: createInput(),
        newPinInput: createInput(),
        confirmPinInput: createInput()
      });
      done();
    });
  });

  suite('_handleCardLockError > ', function() {
    test('if no lockType, close dialog', function() {
      var needToCloseDialog = simPinDialog._handleCardLockError({
        lockType: '',
        retryCount: 3
      });
      assert.isTrue(needToCloseDialog);
    });

    test('if retryCount is not less equal than 0, show message', function() {
      this.sinon.stub(simPinDialog, '_showMessage');
      this.sinon.stub(simPinDialog, '_showRetryCount');
      var needToCloseDialog = simPinDialog._handleCardLockError({
        lockType: 'pin',
        retryCount: 4
      });

      assert.isFalse(needToCloseDialog);
      assert.isTrue(simPinDialog._showMessage.called);
      assert.isTrue(simPinDialog._showRetryCount.called);
    });

    test('if retryCount is 0 and the lockType is pin, close ' +
      'dialog and leave this to system app', function() {
        var needToCloseDialog = simPinDialog._handleCardLockError({
          lockType: 'pin',
          retryCount: 0
        });
        assert.isTrue(needToCloseDialog);
    });

    ['fdn', 'pin2'].forEach(function(lockType) {
      test('if retryCount is 0 and the lockType is ' + lockType +
        ', we will ask users to put puk2', function() {
          this.sinon.stub(simPinDialog, '_initUI');
          var needToCloseDialog = simPinDialog._handleCardLockError({
            lockType: lockType,
            retryCount: 0
          });
          assert.isFalse(needToCloseDialog);
          assert.isTrue(simPinDialog._initUI.calledWith('unlock_puk2'));
      });
    });

    test('if retryCount is 0 and the lockType is un-recognizable,' +
      'then we will just close the dialog', function() {
        var needToCloseDialog = simPinDialog._handleCardLockError({
          lockType: 'i_dont_know',
          retryCount: 0
        });
        assert.isTrue(needToCloseDialog);
    });
  });

  function createInput() {
    var input = document.createElement('input');
    input.type = 'text';
    return input;
  }
});
