import SourceImage from './SourceImage';

export enum AppPage {
    SelectTemplate,
    Edit,
  };

export default class AppState {
    image?: SourceImage
    page: AppPage = AppPage.SelectTemplate
}
  