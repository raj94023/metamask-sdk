import { Component, Prop, h, Event, EventEmitter, State, Watch, Element } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import AdvantagesListItem from '../misc/AdvantagesListItem';
import WalletIcon from '../misc/WalletIcon';
import HeartIcon from '../misc/HeartIcon';
import LockIcon from '../misc/LockIcon';
import InstallIcon from '../misc/InstallIcon';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';
import Logo from '../misc/Logo';
import { FOX_IMAGE } from '../misc/constants';
import { i18n } from 'i18next';
import QRCodeStyling from 'qr-code-styling';

@Component({
  tag: 'mm-install-modal',
  styleUrl: '../style.css',
  shadow: true,
})
export class InstallModal {
  /**
   * The QR code link
   */
  @Prop() link: string;

  @Prop() sdkVersion?: string;

  @Prop() preferDesktop: boolean;

  @Prop() i18nInstance: i18n;

  @Event() close: EventEmitter;

  @Event() startDesktopOnboarding: EventEmitter;

  @State() tab: number;

  @Element() el: HTMLElement;

  constructor() {
    this.onClose = this.onClose.bind(this);
    this.onStartDesktopOnboardingHandler = this.onStartDesktopOnboardingHandler.bind(this);
    this.setTab = this.setTab.bind(this);
    this.render = this.render.bind(this);
    this.setTab(2);
  }

  @Watch('preferDesktop')
  updatePreferDesktop(newValue: boolean) {
    if (newValue) {
      this.setTab(1);
    } else {
      this.setTab(2);
    }
  }

  onClose() {
    this.close.emit();
  }

  onStartDesktopOnboardingHandler() {
    this.startDesktopOnboarding.emit();
  }

  setTab(newTab: number) {
    this.tab = newTab
  }

  componentDidLoad() {
    const qrCode = new QRCodeStyling({
      width: 270,
      height: 270,
      type: 'svg',
      data: this.link,
      image: FOX_IMAGE,
      dotsOptions: {
        color: 'black',
        type: 'rounded',
      },
      imageOptions: {
        margin: 5,
      },
      cornersDotOptions: {
        color: '#f66a07',
      },
      qrOptions: {
        errorCorrectionLevel: 'M',
      },
    });

    qrCode.append(this.el.shadowRoot.querySelector("#sdk-mm-qrcode"))
  }

  render() {
    const t = this.i18nInstance.t;

    return (
      <WidgetWrapper className="install-model">
        <div class='backdrop' onClick={this.onClose}></div>
        <div class='modal'>
          <div class='closeButtonContainer'>
            <div class='right'>
              <span class='closeButton' onClick={this.onClose}>
                <CloseButton />
              </span>
            </div>
          </div>
          <div class='logoContainer'>
            <Logo />
          </div>
          <div>
            <div class='tabcontainer'>
              <div class='flexContainer'>
                <div
                  onClick={() => this.setTab(1)}
                  class={`tab flexItem${this.tab === 1 ? ' tabactive': ''}`}
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => this.setTab(2)}
                  class={`tab flexItem${this.tab === 2 ? ' tabactive': ''}`}
                >
                  {t('MOBILE')}
                </div>
              </div>
            </div>
            <div style={{ display: this.tab === 1 ? 'none' : 'block' }}>
              <div class='flexContainer'>
                <div
                  class='flexItem'
                  style={{
                    textAlign: 'center',
                    marginTop: '4',
                  }}
                >
                  <div id="sdk-mm-qrcode" class='center'>
                  </div>
                  <div class='connectMobileText'>
                    {t('SCAN_TO_CONNECT')} <br />
                    <span class='blue'>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: this.tab === 2 ? 'none' : 'block' }}>
              <div class='item'>
                <AdvantagesListItem
                  Icon={HeartIcon}
                  text={t('INSTALL_MODAL.TRUSTED_BY_USERS')}
                />
              </div>
              <div class='item'>
                <AdvantagesListItem
                  Icon={WalletIcon}
                  text={t('INSTALL_MODAL.LEADING_CRYPTO_WALLET')}
                />
              </div>
              <div class='item'>
                <AdvantagesListItem
                  Icon={LockIcon}
                  text={t('INSTALL_MODAL.CONTROL_DIGITAL_INTERACTIONS')}
                />
              </div>

              <button
                class='button'
                onClick={this.onStartDesktopOnboardingHandler}
              >
                <InstallIcon />
                <span class='installExtensionText'>
                  {t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
          <SDKVersion version={this.sdkVersion} />
        </div>
    </WidgetWrapper>
    )
  }
}
