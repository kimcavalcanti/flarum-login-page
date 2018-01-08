/*
* This file is part of flarum-login-page.
*
* (c) Matteo Pompili <matpompili@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import Modal from 'flarum/components/Modal';
import ForgotPasswordModal from 'matpompili/login-page/components/FullPagePassRecModal';
import SignUpModal from 'flarum/components/SignUpModal';
import Alert from 'flarum/components/Alert';
import Button from 'flarum/components/Button';
import LogInButtons from 'flarum/components/LogInButtons';
import extractText from 'flarum/utils/extractText';
import {override} from 'flarum/extend';

export default class LogInModal extends Modal {
  init() {
    super.init();

    /**
     * The value of the email input.
     *
     * @type {Function}
     */
    this.identification = m.prop(this.props.identification || '');

    /**
     * The value of the password input.
     *
     * @type {Function}
     */
    this.password = m.prop(this.props.password || '');

    /**
     * The value of the remember me input.
     *
     * @type {Function}
     */
    this.remember = m.prop(!!this.props.remember);
  }

  className() {
    return 'LogInModal fullPage';
  }

  title() {
    return app.translator.trans('core.forum.log_in.title');
  }

  content() {
    return [
      <div className="Modal-body">
        <LogInButtons/>

        <div className="logo">
          <img src={app.forum.attribute('logoURL') ? app.forum.attribute('logoURL')
           : 'https://placeholdit.imgix.net/~text?txtsize=33&txt=300x300&w=300&h=300'} />
          <h1>{app.forum.attribute('title')}</h1>
        </div>

        <div className="Form Form--centered">
          <div className="Form-group">
            <input className="FormControl" name="identification" type="text" placeholder={extractText(app.translator.trans('core.forum.log_in.username_or_email_placeholder'))}
              bidi={this.identification}
              disabled={this.loading} />
          </div>

          <div className="Form-group">
            <input className="FormControl" name="password" type="password" placeholder={extractText(app.translator.trans('core.forum.log_in.password_placeholder'))}
              bidi={this.password}
              disabled={this.loading} />
          </div>

          <div className="Form-group">
            {Button.component({
              className: 'Button Button--primary Button--block',
              type: 'submit',
              loading: this.loading,
              children: app.translator.trans('core.forum.log_in.submit_button')
            })}
          </div>

          <div className="Form-group">
            <p className="Button Button--primary Button--block">
              <a style="color: white" onclick={this.forgotPassword.bind(this)}>{app.translator.trans('core.forum.log_in.forgot_password_link')}</a>
            </p>
          </div>
        </div>
      </div>
    ];
  }

  /**
   * Open the forgot password modal, prefilling it with an email if the user has
   * entered one.
   *
   * @public
   */
  forgotPassword() {
    const email = this.identification();
    const props = email.indexOf('@') !== -1 ? {email} : undefined;

    app.modal.show(new ForgotPasswordModal(props));
  }

  /**
   * Open the sign up modal, prefilling it with an email/username/password if
   * the user has entered one.
   *
   * @public
   */
  signUp() {
    const props = {password: this.password()};
    const identification = this.identification();
    props[identification.indexOf('@') !== -1 ? 'email' : 'username'] = identification;

    app.modal.show(new SignUpModal(props));
  }

  onready() {
    this.$('[name=' + (this.identification() ? 'password' : 'identification') + ']').select();
  }

  onsubmit(e) {
    e.preventDefault();

    this.loading = true;

    const identification = this.identification();
    const password = this.password();
    const remember = this.remember();

    app.session.login({identification, password, remember}, {errorHandler: this.onerror.bind(this)})
      .then(
        () => window.location.reload(),
        this.loaded.bind(this)
      );
  }

  onerror(error) {
    if (error.status === 401) {
      error.alert.props.children = app.translator.trans('core.forum.log_in.invalid_login_message');
    }

    super.onerror(error);
  }
}

override(LogInModal.prototype, 'view', function (){

  return (
    <div className={'Modal modal-dialog ' + this.className()}>
      <div className="Modal-content">
        {''}

        <form onsubmit={this.onsubmit.bind(this)}>
          <div className="Modal-header">
            <h3 className="App-titleControl App-titleControl--text">{this.title()} -  ciao</h3>
          </div>

          {alert ? <div className="Modal-alert">{this.alert}</div> : ''}

          {this.content()}
        </form>
      </div>
    </div>
  );
});
