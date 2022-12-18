export enum AppPage {
    SelectTemplate,
    Edit,
  };

export default class AppState {
    image: string = "" // base64-encoded
    page: AppPage = AppPage.SelectTemplate
}
  