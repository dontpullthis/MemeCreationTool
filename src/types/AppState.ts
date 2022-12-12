export enum AppPage {
    SelectTemplate,
    Edit,
  };

export default class AppState {
    filePath: string = ""
    page: AppPage = AppPage.SelectTemplate
}
  