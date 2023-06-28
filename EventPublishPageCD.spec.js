const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const CDEventPubPage = require('../../Pages/Components/EventPublish');
const Environment = require('../../Data/Environment.json');
const eventPubData = require('../../Data/EventPublish.json');
const CDNotificationsPage = require('../../Pages/CDNotificationsPage').default;
const { default: CMNotificationsPage } = require('../../Pages/CMNotificationsPage');
const CDPageWithCommentsComponent = require('../../Pages/CDPageWithCommentsComponent');
const bookmarksAPIs = require('../../Apis/BookmarksAPIs');
const CDBookmarksPage = require('../../Pages/CDBookmarksPage').default;
const SearchBar = require('../../Pages/Components/SearchBar');

let cdPage;
let cdContext;
let browser;
let cdState;
let EventPubPage;
let state;
let cmPage;
let cmContext;
let cdNotificationsPage;
let cmNotificationsPage;
let bookmarksPage;
const cmURL = Environment.CMURL;
const tag = Environment.CDUserTag;
const envURL = Environment.CDURL;
let articlePage;
let searchBar;
let articlePage2;
let cdPage2;
let cdContext2;
let postIdValue;
let dataSourceIdValue;
let cdState2;
let personCardPage;


test.describe('Event Publish Tests', () => {
    test.beforeAll(async () => {
        // getting CD state to pass to the new browsers
        cdState = JSON.parse(fs.readFileSync('CDstate.json'));
        state = JSON.parse(fs.readFileSync('state.json'));
      });

      test.beforeEach(async () => {
        // start browsers with the correct states for CM and CD
        test.setTimeout(90000);
        browser = await chromium.launch({headless: false, args: ['--start-maximized'] });
        cdContext = await browser.newContext({ viewport: null, storageState: cdState });
    
        cdPage = await cdContext.newPage();
        EventPubPage = new CDEventPubPage(cdPage, cdContext);
    
      //  await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
       
      });


      eventPubData.forEach((EventpubData) => {
        if (EventpubData.Action!="Click"){
          return;
        }
          test.only(`Check ${EventpubData.EventName}`, async () => {
            await cdPage.goto(`${envURL}${EventpubData.pageUrl}`, { waitUntil: 'networkidle' });

            const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

            await EventPubPage.clickComponent(EventpubData.Locator);
            const request = await requestPromise;
            const dataJson = request.postDataJSON();
            const propertyNames = Object.keys(dataJson);
    
            await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
            await expect.soft(dataJson.contentItemCategory).toBe(EventpubData.contentItemCategory);
            await expect.soft(dataJson.contentItemId).toBe(EventpubData.contentItemId);
            await expect.soft(dataJson.contentItemName).toBe(EventpubData.contentItemName);
            await expect.soft(dataJson.eventId).toBe(EventpubData.ClickeventId);
            await expect.soft(dataJson.eventName).toBe(EventpubData.ClickeventName);
            await expect.soft(propertyNames).toContain(EventpubData.eventTimestamp);
            await expect.soft(dataJson.pageId).toBe(EventpubData.pageId);
            await expect.soft(dataJson.pageLanguage).toBe(EventpubData.pageLanguage);
            await expect.soft(propertyNames).toContain(EventpubData.pageReferrer);
            await expect.soft(dataJson.pageTitle).toBe(EventpubData.pageTitle);
            await expect.soft(propertyNames).toContain(EventpubData.pageType);
            await expect.soft(dataJson.pageUrl).toContain(EventpubData.pageUrl);
            await expect.soft(propertyNames).toContain(EventpubData.sessionId);
            await expect.soft(dataJson.subsiteId).toBe(EventpubData.subsiteId);
            await expect.soft(dataJson.subsiteName).toBe(EventpubData.subsiteName);

            if (EventpubData.ClickeventName === "MediaFileDownload") {
              await expect(dataJson.fileUrl).toBe(EventpubData.mFileFileURL);
            } 
            
            if (EventpubData.ClickeventName === "ToolsAndResourcesClick"){
              await expect(dataJson.appName).toBe(EventpubData.appName);
              await expect(dataJson.contentLocation).toBe(EventpubData.contentLocation);
            }

            if (EventpubData.ClickeventName === "EmailSharing"){
              await expect(dataJson.channel).toBe(EventpubData.channel);
            }

            if (EventpubData.ClickeventName === "SubscribeInterest"){
              await expect(dataJson.tagAdded).toBe(EventpubData.tagAdded);
              await expect(dataJson.tagName).toBe(EventpubData.tagName);

            }

            else {
              return;
            }
        });
      });


      test(`Check Add Bookmarks Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const matchingObject = eventPubData.find(obj => obj.BookmarkEventName === 'AddBookmark Event')
        await EventPubPage.clickComponent(matchingObject.Locator);

        const allRootBookmarks = await bookmarksAPIs.getAllRootBookmarks(cdState);
        for (let i = 0; i < allRootBookmarks.length; i += 1) {
        await bookmarksAPIs.deleteBookmark(cdState,allRootBookmarks[i].Id);      
        }
        bookmarksPage = new CDBookmarksPage(cdPage, cdContext);
        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
        
        const folderName = `Add Bookmark Folder`;
        await bookmarksPage.createNewItem({ isFolder: true, name: folderName });

        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

      if (matchingObject) {
          await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
          await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
          await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
          await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
          await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
          await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
          await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
          await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
          await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
          await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
          await expect.soft(propertyNames).toContain(matchingObject.pageType);
          await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
          await expect.soft(propertyNames).toContain(matchingObject.sessionId);
          await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
          await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
        } else {
          console.log('Matching object not found');
        }

      });

      test(`Check PollAndSurveySubmit Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const matchingObject = eventPubData.find(obj => obj.PollSurveyEventName === 'PollsAndSurveysSubmit Event')
        await EventPubPage.clickComponent(matchingObject.Locator);

        await EventPubPage.SubmitSurvey('Test');
        const submitButton = await cdPage.locator('//input[@value= "Submit"]');

        // Move the mouse to the center of the element and click it
        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
        await submitButton.hover();
        await submitButton.click();

        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        // await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        // await expect.soft(dataJson.contentItemId).toBe(eventPubData[10].contentItemId);
        // await expect.soft(dataJson.contentItemName).toBe(eventPubData[10].contentItemName);
        // await expect.soft(dataJson.eventId).toBe(eventPubData[10].ClickeventId);
        // await expect.soft(dataJson.eventName).toBe(eventPubData[10].ClickeventName);
        // await expect.soft(propertyNames).toContain(eventPubData[10].eventTimestamp);
        // await expect.soft(dataJson.pageId).toBe(eventPubData[10].pageId);
        // await expect.soft(dataJson.pageLanguage).toBe(eventPubData[10].pageLanguage);
        // await expect.soft(propertyNames).toContain(eventPubData[10].pageReferrer);
        // await expect.soft(dataJson.pageTitle).toBe(eventPubData[10].pageTitle);
        // await expect.soft(propertyNames).toContain(eventPubData[10].pageType);
        // await expect.soft(dataJson.pageUrl).toContain(eventPubData[10].pageUrl);
        // await expect.soft(propertyNames).toContain(eventPubData[10].sessionId);
        // await expect.soft(dataJson.subsiteId).toBe(eventPubData[10].subsiteId);
        // await expect.soft(dataJson.subsiteName).toBe(eventPubData[10].subsiteName);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
        }
        else {
          console.log('Matching object not found');
        }
        
      });


      test(`Check Rating Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const matchingObject = eventPubData.find(obj => obj.EventName === 'Rating Event')
        await EventPubPage.clickComponent(matchingObject.secondaryContent);

        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
   
        await EventPubPage.rateBy('5');

        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
          await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(dataJson.rating).toBe(matchingObject.rating);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);

        } else {
          console.log('Matching object not found');
        }


      });

      test(`Check Add Reaction Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const matchingObject = eventPubData.find(obj => obj.EventName === 'Reaction Event')
        await EventPubPage.clickComponent(matchingObject.secondaryContent);

        const requestPromise = cdPage.waitForRequest(async (request) => {
          if (!request.url().includes('events')) return false; 
          const dataJson = request.postDataJSON();
          await EventPubPage.likeReaction();
          if (!dataJson || dataJson.eventName !== 'Reactions') return false; 
          return true;
        });


        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(dataJson.reactionAdded).toBe(matchingObject.reactionAdded);
        await expect.soft(dataJson.reactionName).toBe(matchingObject.reactionName);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);

        } else {
          console.log('Matching object not found');
        }


        // await EventPubPage.likeReaction();
        // await expect.soft(dataJson.reactionAdded).toBe(eventPubData[22].reactionAdded);
      });


      test(`Check Page View Event`, async () => {
         
        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        const matchingObject = eventPubData.find(obj => obj.EventName === 'PageView Event')

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
        } else {
          console.log('Matching object not found');
        }

      });

      test(`Check Search Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });

        searchBar = new SearchBar(cdPage, cdContext);
        
        const searchData = "People are now testing Tesla's 'full self-driving' on real kids";
         await searchBar.searchWithoutWait(searchData);
        // await EventPubPage.ClickOnSearchIcon();
        // await EventPubPage.SearchFor(searchData);

       const requestPromise = cdPage.waitForRequest((request) => {
        if (!request.url().includes('events')) return false; 
        const dataJson = request.postDataJSON();
        if (!dataJson || dataJson.eventName !== 'Search') return false; 
        return true;
      });
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);
        const matchingObject = eventPubData.find(obj => obj.EventName === 'Search Event')

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(dataJson.pageReferrer).toContain(Environment.CDURL);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.pageType).toBe(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(dataJson.searchKeyword).toBe(matchingObject.searchKeyword);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });


      test(`Check Top SearchResultClick Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });

        const searchData = "People are now testing Tesla's 'full self-driving' on real kids";
        await EventPubPage.ClickOnSearchIcon();
        await EventPubPage.SearchFor(searchData);
        const matchingObject = eventPubData.find(obj => obj.EventName === 'SearchResultClick Event')

        const requestPromise = cdPage.waitForRequest(async (request) => {
          if (!request.url().includes('events')) return false; 
          const dataJson = request.postDataJSON();

        
         const locator = matchingObject.Locator;
          await EventPubPage.clickComponent(locator);
          const closePopUp = "//button[contains(@class, 'close')]"
         await EventPubPage.clickComponent(closePopUp);
          if (!dataJson || dataJson.eventName !== 'SearchResultClick') return false; 
          return true;
        });
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.isTopSearchResult).toBe(matchingObject.isTopSearchResult);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(dataJson.pageReferrer).toContain(Environment.CDURL);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.pageType).toBe(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(dataJson.searchKeyword).toBe(matchingObject.searchKeyword);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check Not Top SearchResultClick Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}/Search`, { waitUntil: 'networkidle' });
        
        
        // const searchData = "Automation";
        // await EventPubPage.ClickOnSearchIcon();
        // await EventPubPage.SearchFor(searchData);
        await EventPubPage.searchPageNext();
         const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

         const matchingObject = eventPubData.find(obj => obj.EventName === 'SearchResultnotTopClick Event')
         const locator = matchingObject.Locator;
         await EventPubPage.clickComponent(locator);
        await cdPage.keyboard.down('Escape');

         const request = await requestPromise;
         const dataJson = request.postDataJSON();
         const propertyNames = Object.keys(dataJson);

         if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.isTopSearchResult).toBe(matchingObject.isTopSearchResult);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.pageType).toBe(matchingObject.pageType);
        await expect.soft(propertyNames).toContain(matchingObject.pageUrl);
       // await expect.soft(dataJson.searchKeyword).toBe(eventPubData[16].searchKeyword);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }


      });


      test(`Check Notification Click Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}`, { waitUntil: 'networkidle' });
        cmContext = await browser.newContext({ viewport: null, storageState: state });
        cmPage = await cmContext.newPage();
        cdNotificationsPage = new CDNotificationsPage(cdPage, cdContext);
        cmNotificationsPage = new CMNotificationsPage(cmPage, cmContext);
        cmPage.goto(`${cmURL}`, { waitUntil: 'networkidle' });
        await cmPage.waitForLoadState('networkidle');

        const title = `This the Title ${Math.floor(Math.random() * 1000)}`;
        const subTitle = `This the SubTitle ${Math.floor(Math.random() * 1000)}`;
        const summary = `This the Summary ${Math.floor(Math.random() * 1000)}`;
        const author = `This the Author ${Math.floor(Math.random() * 1000)}`;
        const link = 'https://www.google.com/';
        await cmNotificationsPage.goToNotificationPage();
        await cmNotificationsPage.sendNotification({
        Title: title, SubTitle: subTitle, Message: summary, Author: author, Link: link, Tags: tag
        });
        await cdPage.reload();
        await cdNotificationsPage.clickOnNotificationBell();
        await cdNotificationsPage.goToNotificationPage();

        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

        const [newPage] = await Promise.all([
        cdContext.waitForEvent('page'),
        //await cdNotificationsPage.clickOnNotification(Type.Center, Tab.All, Category.Recent, 1),
        await cdNotificationsPage.clickOnNotification('dozen-notifications', 'All', 'Recent', 1),
        ]);
        await expect(newPage).toHaveURL(link);

        // const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

         const request = await requestPromise;
         const dataJson = request.postDataJSON();
         const propertyNames = Object.keys(dataJson);

         const matchingObject = eventPubData.find(obj => obj.EventName === 'NotificationClick Event')

         if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(propertyNames).toContain(matchingObject.itemAuthor);
        await expect.soft(propertyNames).toContain(matchingObject.itemTitle);
        await expect.soft(dataJson.itemUrl).toBe(matchingObject.itemUrl);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.pageType).toBe(matchingObject.pageType);
        await expect.soft(propertyNames).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check Page Scroll Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
  
       const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

        await cdPage.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight * 0.25);
        });


        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);
        const matchingObject = eventPubData.find(obj => obj.EventName === 'PageScroll Event')

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.scrollPercentage).toBe(matchingObject.scrollPercentage);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });


      test(`Check Page Duration Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
  
       const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
       const matchingObject = eventPubData.find(obj => obj.EventName === 'PageDuration Event')
       await EventPubPage.clickComponent(matchingObject.Locator);
       await cdPage.evaluate(() => window.stop());

        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.scrollPercentage).toBe(matchingObject.scrollPercentage);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(propertyNames).toContain(matchingObject.duration);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check Add Comment Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
        articlePage = new CDPageWithCommentsComponent(cdPage);

        const matchingObject = eventPubData.find(obj => obj.EventName === 'AddComment Event')
        await EventPubPage.clickComponent(matchingObject.secondaryContent);

       // Delete All comments
      // const allComments = await commentsAPIs.getAllComments(cdState, postIdValue, dataSourceIdValue);
      // for (let i = 0; i < allComments.Comments.length; i += 1) {
      // if (Environment.CDUserShortName.includes(allComments.Comments[i].User.FirstName)) {
      // await commentsAPIs.deleteComment(cdState, postIdValue, dataSourceIdValue, allComments.Comments[i].Id, allComments.Comments[i].ModifiedOn);
      //   } else { await commentsAPIs.deleteComment(cdState2, postIdValue, dataSourceIdValue, allComments.Comments[i].Id, allComments.Comments[i].ModifiedOn); }
      // }
      // // Refresh Page after deleting comments
      // await cdPage.reload({ waitUntil: 'networkidle' });
      
        const requestPromise = cdPage.waitForRequest(async (request) => {
          
      if (!request.url().includes('events')) return false; 
      const dataJson = request.postDataJSON();
      const comment = "Comment1";
        await articlePage.addNewComment(comment);
          
      if (!dataJson || dataJson.eventName !== 'AddComment') return false; 
      return true;
    });
    const request = await requestPromise;
    const dataJson = request.postDataJSON();
    const propertyNames = Object.keys(dataJson);

    if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.scrollPercentage).toBe(matchingObject.scrollPercentage);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check Add Reply Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
        articlePage = new CDPageWithCommentsComponent(cdPage);

        const matchingObject = eventPubData.find(obj => obj.EventName === 'AddReply Event')
        await EventPubPage.clickComponent(matchingObject.secondaryContent);
         const comment = "Comment1";

        const requestPromise = cdPage.waitForRequest(async (request) => {
        if (!request.url().includes('events')) return false; 
        const dataJson = request.postDataJSON();
        const reply = "Reply1";
        await articlePage.replyToComment(comment, reply);

         if (!dataJson || dataJson.eventName !== 'AddReply') return false; 
         return true;
         });

        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(propertyNames).toContain(matchingObject.commentId);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.scrollPercentage).toBe(matchingObject.scrollPercentage);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);

        await articlePage.deleteComment(comment);

      });

      test(`Check Remove Reaction Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        const matchingObject = eventPubData.find(obj => obj.EventName === 'RemoveReaction Event')
        await EventPubPage.clickComponent(matchingObject.secondaryContent);
        await EventPubPage.likeReaction();
        //const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));
        const requestPromise = cdPage.waitForRequest(async (request) => {
          if (!request.url().includes('events')) return false; 
          const dataJson = request.postDataJSON();
          await EventPubPage.likeReaction();
          if (!dataJson || dataJson.eventName !== 'Reactions') return false; 
          return true;
        });

        //await cdPage.waitForTimeout(2000);
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.contentItemId).toBe(matchingObject.contentItemId);
        await expect.soft(dataJson.contentItemName).toBe(matchingObject.contentItemName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(dataJson.reactionAdded).toBe(matchingObject.reactionAdded);
        await expect.soft(dataJson.reactionName).toBe(matchingObject.reactionName);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });


      test(`Check Remove ToolsAndResources Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        await EventPubPage.openPersonalizeMenu();
        await EventPubPage.clickonFavAppName();
        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

        const matchingObject = eventPubData.find(obj => obj.EventName === 'ToolsAndResourcesRemove Event')
        await EventPubPage.clickComponent(matchingObject.Locator);
        
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.appId).toBe(matchingObject.appId);
        await expect.soft(dataJson.appName).toBe(matchingObject.appName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check Add ToolsAndResources Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
         
        await EventPubPage.openPersonalizeMenu();
        await EventPubPage.clickonSearchAppName();
        const requestPromise = cdPage.waitForRequest((url) => url.url().includes('events'));

        const matchingObject = eventPubData.find(obj => obj.EventName === 'ToolsAndResourcesAdd Event')
        await EventPubPage.clickComponent(matchingObject.Locator);
        
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.appId).toBe(matchingObject.appId);
        await expect.soft(dataJson.appName).toBe(matchingObject.appName);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
      } else {
        console.log('Matching object not found');
      }

      });

      test(`Check ListingViewAll Event`, async () => {
        await cdPage.goto(`${Environment.CDURL}AutoData/Auto EventPublish Subsite/Automation EventPublish`, { waitUntil: 'networkidle' });
       await cdPage.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight * 0.25);
      });
      const matchingObject = eventPubData.find(obj => obj.EventName === 'ListingViewAll Event')
        const requestPromise = cdPage.waitForRequest(async (request) => {
          if (!request.url().includes('events')) return false;
          const dataJson = request.postDataJSON();
          await EventPubPage.clickComponent(matchingObject.Locator);
          await cdPage.bringToFront();
          if (!dataJson || dataJson.eventName !== 'ListingViewAll') return false; 
          return true;
        });
        const request = await requestPromise;
        const dataJson = request.postDataJSON();
        const propertyNames = Object.keys(dataJson);

        if (matchingObject) {
        await expect.soft(dataJson.contactId).toBe(Environment.CDUsername);
        await expect.soft(dataJson.eventId).toBe(matchingObject.ClickeventId);
        await expect.soft(dataJson.eventName).toBe(matchingObject.ClickeventName);
        await expect.soft(propertyNames).toContain(matchingObject.eventTimestamp);
        await expect.soft(dataJson.pageId).toBe(matchingObject.pageId);
        await expect.soft(dataJson.pageLanguage).toBe(matchingObject.pageLanguage);
        await expect.soft(propertyNames).toContain(matchingObject.pageReferrer);
        await expect.soft(dataJson.pageTitle).toBe(matchingObject.pageTitle);
        await expect.soft(dataJson.scrollPercentage).toBe(matchingObject.scrollPercentage);
        await expect.soft(propertyNames).toContain(matchingObject.pageType);
        await expect.soft(dataJson.pageUrl).toContain(matchingObject.pageUrl);
        await expect.soft(propertyNames).toContain(matchingObject.sessionId);
        await expect.soft(dataJson.subsiteId).toBe(matchingObject.subsiteId);
        await expect.soft(dataJson.subsiteName).toBe(matchingObject.subsiteName);
        await expect.soft(dataJson.contentLocation).toBe(matchingObject.contentLocation);
        await expect.soft(dataJson.listUrl).toBe(matchingObject.listUrl);
      } else {
        console.log('Matching object not found');
      }

      });

    test.afterEach(async () => {
        await browser.close();
      });
});