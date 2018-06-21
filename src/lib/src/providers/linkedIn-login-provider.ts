import { BaseLoginProvider } from "../entities/base-login-provider";
import { SocialUser } from "../entities/user";
import { LoginOpt } from "../auth.service";

declare let IN: any;

export class LinkedInLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = "LINKEDIN";

  constructor(
    private clientId: string,
    private authorize?: boolean,
    private lang?: string
  ) {
    super();
  }

  initialize(): Promise<void> {
    let inner_text = "";

    inner_text += "api_key: " + this.clientId + "\r\n";
    inner_text += "authorize:" + (this.authorize ? "true" : "false") + "\r\n";
    inner_text += "lang: " + (this.lang ? this.lang : "fr_FR") + "\r\n";

    return new Promise((resolve, reject) => {
      this.loadScript(
        LinkedInLoginProvider.PROVIDER_ID,
        "//platform.linkedin.com/in.js",
        () => {
          let that = this;
          setTimeout(() => {
            this._readyState.next(true);
            resolve();
          }, 800);
        },
        false,
        inner_text
      );
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        resolve(new SocialUser());
        // this.signIn().then(
        //     user => resolve(user)
        // )
      });
    });
  }

  signIn(): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        IN.User.authorize(function() {
          IN.API.Raw(
            "/people/~:(id,first-name,last-name,email-address,picture-url)"
          ).result(function(res: any) {
            let user: SocialUser = new SocialUser();
            user.id = res.id;
            user.name = res.firstName + " " + res.lastName;
            user.email = res.emailAddress;
            user.photoUrl = res.pictureUrl;
            user.firstName = res.firstName;
            user.lastName = res.lastName;
            user.authToken = IN.ENV.auth.oauth_token;
            resolve(user);
          });
        });
      });
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onReady().then(() => {
        IN.User.logout(function() {
          resolve();
        }, {});
      });
    });
  }
}
