const Type = {
  Center: 'dozen-notifications',
  Menu: 'dozen-notifications dozen-notifications-panel',
};

const Tab = {
  All: 'All',
  Unread: 'Unread',
};

/* const Category = {
  Recent: 'Recent',
  Earlier: 'Earlier',
}; */

const Data = {
  Title: 'item.title',
  Author: 'item.author',
  SubTitle: 'item.subtitle',
  Summary: 'item.body',
  Date: 'moment.utc(item.createdOn).local().fromNow()',
  Unread: 'unread',
};


class EventPublish{
    constructor(page, context) {
        // locators
        this.page = page;
        this.context = context;

        //Bookmarks
        this.emptyBookmarksMsg = page.locator('//div[contains(@class,"dozen-bookmarks-component")]//*[contains(@class,"dozen-bookmarks-empty-msg")]');
        this.listOfMainFoldersThreeDotsButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/button');
        this.listOfMainFolderDeleteButton = page.locator('//*[@id="dozen-bookmarks-tree"]/ul/li/div[@class="dozen-list-menu-wrapper"]/ul/li/span[@class="delete-bookmark"]');
        this.confirmDelete = page.locator('//*[@class="dozen-confirm-btns"]/button[contains(text(),"Delete")]');
        this.submitButton = page.locator('//*[@id="form-submit-btn"]');
        this.addBookmarkEmptyButton = page.locator('//*[@id="add-bookmark-btn-empty"]');
        this.addBookmarkButton = page.locator('//*[@id="add-bookmark-btn"]');
        this.folderInput = page.locator('//input[@name="IsFolder"and@value="true"]');
        this.linkRadioButton = page.locator('//input[@name="IsFolder"and@value="false"]');
        this.titleInput = page.locator('//*[@id="Title"]');
        this.linkInput = page.locator('//*[@id="Link"]');
        this.locationDropDownMenu = page.locator('//div[@class="choices__inner"]');
        this.bookmarksApp = 'dozen-bookmarks-app';
        
        //PollSurvey
        this.submitTextField = page.locator('//input[@data-val-required= "Enter your Name is required."]');
        this.submitSurveyRadio = page.locator('//input[@value="Option 1"]');
        this.submitSurveySubmitButton = page.locator('//input[@value= "Submit"]');

        //interactions
        this.secondaryContent = page.locator('//div[contains(@class, "dozen-side-content")]');
        this.reactionButton = '//button[contains(@class, "all-reactions-trigger reaction popover-reaction")]';
        this.loveButton = '//div[contains(@class,"rounded-3xl")]//img[contains(@src,"love")]';
        //this.likeButton = '//div[@key = "0"]';
        this.likeButton = "//img[@title = 'Like']";

        //Search
        this.searchICon = '//a[contains(@class,"dozen-mobile-megamen-show-search show-search")]';
        this.topSearchInput = "//div[contains(@class,'search-desktop')]//input[@class='search-box-input tt-input']";
        this.searchResults = "//div[contains(@class,'dozen-default-search-results')]";
        this.firstSearchItem = "ul > li:nth-child(1) > div.dozen-card.dozen-card-elevation.dozen-card-rounded > div.dz-tile-content > div.dz-leading-content > div.dz-title-and-preview > a";
        this.ClosePopUp = "//button[contains(@class, 'close')]";
        this.searchPageNavigate = "//li[contains(@class, 'page-selector-item-next')]";

        //Notifications
        this.notificationsButton = page.locator('//span[contains(text(),"Notifications")]');
        this.titleInput = page.locator('//input[@id="Title"]');
        this.subTitleInput = page.locator('//input[@id="subTitle"]');
        this.messageTextArea = page.locator('//textarea[@id="Message"]');
        this.linkInput = page.locator('//input[@id="Link"]');
        this.authorInput = page.locator('//input[@id="Author"]');
        this.sendButton = page.locator('//button[contains(text(),"Send")]');
        this.msg = page.locator('//span[@class="form-msg--text" and contains(text(),"successfully")]');
        this.bell = page.locator('div.notifications-bell');
        this.viewFullNotifications = page.locator('//div[contains(@class,"dozen-notification-viewFullPage")]/a[contains(text(),"View full notifications page")]');

        //interactions
        // this.replyTextArea = page.locator('//div[3]/div/textarea');
        // this.replyButton = page.locator('//span[contains(text(), "Reply")]');
        this.commentInput = '.comment-input';
        this.commentButton = '.comment-btn';
        this.commentWrapper = '.comment-item-wrapper';
        this.commentInput = '.comment-input';
        this.commentsParentDiv = '.dozen-comments';


        //ToolsandResources
        this.PersonalizationButton = "//div[contains(@class, 'quick-apps__item quick-apps__item--personalize')]";
        this.FavAppName = "//div[@class='fav-container']//span[text()='Auto_Music Hub']";
        this.SearchSectionAppName = "//div[@class='search-container']//span[text()='Auto_Music Hub']";

    }
    async clickComponent(component) {
        await this.page.locator(component).click();
    }


      async SubmitSurvey(Username) {
        await this.submitTextField.fill(Username);
        await this.submitSurveyRadio.click();
        await this.page.waitForTimeout(1000);
        // await this.submitSurveySubmitButton.click();
        // await this.page.waitForTimeout(1000);
        await this.page.waitForLoadState('networkidle');
      }

      async rateBy(ratingNumber) {
        await this.page.click(`//div[@class="dozen-ratings interactive "]//div[@class="rating-wrapper"]//div[@class="rating--edit"]//span[${ratingNumber}]`, { force: true });
      }

      async likeReaction() {
        await this.page.click(this.reactionButton);
        await this.page.click(this.likeButton);
      }

      async ClickOnSearchIcon() {
        await this.page.waitForSelector(this.searchICon, { waitFor: 'visible', timeout: 30000 });
        this.page.on('response', (data) => { });
        await this.page.click(this.searchICon);
      }

      async SearchFor(searchData) {
        await this.page.waitForSelector(this.topSearchInput, { waitFor: 'visible', timeout: 15000 });
        await this.page.fill(this.topSearchInput, searchData);
        // await this.page.waitForSelector(`text=${searchData}[1]`, { waitFor: "visible", timeout: 15000 });
        this.page.on('response', (data) => { });
        await this.page.locator(`text=${searchData}`).nth(1).click();
      }

      async scrollDown(x,y){
        await this.page.mouse.wheel(x, y);
      }

      async waitLoading() {
        const locator = this.page.locator(this.searchResults);
        await this.page.waitForSelector(this.searchResults, { waitFor: 'visible', timeout: 90000 });
        await this.page.waitForTimeout(1000);
        await expect(locator).not.toHaveClass(/loading-in-progress/, { timeout: 90000 });
      }

      async searchPageNext() {
        await this.page.locator(this.searchPageNavigate).click();
      }

      async clickOnNotificationBell() {
        await this.page.waitForLoadState('networkidle');
        await this.bell.click();
        await this.page.waitForLoadState('networkidle');
      }

      async clickOnNotification(type, tab, category, index) { // Done
        await this.page.locator(`${this.getFullNotificationXpath(type, tab, category, index)}//span[@x-text="${Data.Title}"]`).click();
      }

      async goToNotificationPage() {
        await Promise.all([
          this.page.waitForNavigation(),
          this.viewFullNotifications.click()
        ]);    
      }
      // async clickConfirmReplyToComment() {
      //   await this.page.locator(this.commentsParentDiv)
      //     .locator(this.commentWrapper)
      //     .locator(this.commentButton)
      //     .click();
      // }
      // async replytoComment(reply) {
      //   await this.page.locator(this.replyButton).click();
      //   await this.page.locator(this.replyTextArea).fill(reply)
      //   await this.clickConfirmReplyToComment();
      // }

      async clickConfirmReplyToComment() {
        await this.page.locator(this.commentsParentDiv)
          .locator(this.commentWrapper)
          .locator(this.commentButton)
          .click();
      }

      async replyToComment(comment, reply) {
        await this.clickReplyToComment(comment);
        await this.page.locator(this.commentsParentDiv)
          .locator(this.commentWrapper)
          .locator(this.commentInput)
          .fill(reply);
        await this.clickConfirmReplyToComment();
      }

      async openPersonalizeMenu() {
        await this.page.locator(this.PersonalizationButton).click();
    }

    async clickonFavAppName() {
      await this.page.locator(this.FavAppName).click();
  }

  async clickonSearchAppName() {
    await this.page.locator(this.SearchSectionAppName).click();
}
}
module.exports = EventPublish;