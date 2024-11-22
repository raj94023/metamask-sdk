import { Component, Prop, h, Event, EventEmitter, State, Watch, Element } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';
import Logo from '../misc/Logo';
import ConnectIcon from '../misc/ConnectIcon';
import { MetamaskExtensionImage } from '../misc/MetamaskExtensionImage';
import encodeQR from '@paulmillr/qr';
import { SimpleI18n } from '../misc/simple-i18n';

@Component({
  tag: 'mm-select-modal',
  styleUrl: '../style.css',
  shadow: true,
})
export class SelectModal {
  /**
   * The QR code link
   */
  @Prop() link: string;

  @Prop() sdkVersion?: string;

  private i18nInstance: SimpleI18n;

  @Event() close: EventEmitter<{ shouldTerminate?: boolean }>;

  @Event() connectWithExtension: EventEmitter;

  @State() tab: number = 1;

  @Element() el: HTMLElement;

  @State() private translationsLoaded: boolean = false;

  constructor() {
    this.i18nInstance = new SimpleI18n();
  }

  async connectedCallback() {
    await this.i18nInstance.init({
      fallbackLng: 'en'
    });
    this.translationsLoaded = true;
  }

  onClose(shouldTerminate = false) {
    this.close.emit({ shouldTerminate });
  }

  connectWithExtensionHandler() {
    this.connectWithExtension.emit();
  }

  setTab(tab: number) {
    this.tab = tab;
  }

  @Watch('link')
  updateLink(newLink: string) {
    const svgElement = encodeQR(newLink, "svg", {
      ecc: "medium",
      scale: 2
    })

    if (!this.el.shadowRoot) {
      return;
    }

    const qrcodeDiv = this.el.shadowRoot.querySelector("#sdk-mm-qrcode");

    if (!qrcodeDiv) {
      return;
    }

    qrcodeDiv.innerHTML = svgElement
  }

  disconnectedCallback() {
    this.onClose();
  }

  render() {
    if (!this.translationsLoaded) {
      return null;
    }

    const t = (key: string) => this.i18nInstance.t(key);

    const sdkVersion = this.sdkVersion

    return (
      <WidgetWrapper className="select-modal">
        <div class='backdrop' onClick={() => this.onClose(true)}></div>
        <div class='modal'>
          <div class='closeButtonContainer'>
            <div class='right'>
              <span class='closeButton' onClick={() => this.onClose(true)}>
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
                  class={`tab flexItem ${this.tab === 1 ? 'tabactive' : ''}`}
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => this.setTab(2)}
                  class={`tab flexItem ${this.tab === 2 ? 'tabactive' : ''}`}
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
                  <div class='center' id="sdk-mm-qrcode" />
                  <div class='connectMobileText'>
                    {t('SCAN_TO_CONNECT')}
                    <br />
                    <span class='blue'>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: this.tab === 2 ? 'none' : 'block' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '300',
                  marginTop: '-20',
                }}
              >
                <MetamaskExtensionImage />
              </div>
              <div class='extensionLabel'>
                {t('SELECT_MODAL.CRYPTO_TAKE_CONTROL_TEXT')}
              </div>

              <button class='button' onClick={this.connectWithExtensionHandler}>
                <ConnectIcon />
                <span class='installExtensionText'>
                  {t('CONNECT_WITH_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
          <SDKVersion version={sdkVersion} />
        </div>
      </WidgetWrapper>
    )
  }
}