// pages/ProjectManagementPage.js
const { BasePage } = require('./BasePage');

class ProjectManagementPage extends BasePage {
  constructor(page) {
    super(page);

    this.path               = '/client/project-management';

    // Header
    this.overviewBanner     = '[class*="banner"], [class*="header-bar"], div:has-text("Overview of Project")';
    this.timeEffortTab      = 'button:has-text("Time & Effort"), [class*="tab"]:has-text("Time & Effort")';
    this.progressTab        = 'button:has-text("Progress Overview"), [class*="tab"]:has-text("Progress")';

    // Filters
    this.projectDropdown    = 'select:first-of-type, [placeholder*="Project" i]:first-of-type';
    this.stringFilter       = 'select:nth-of-type(2)';
    this.locationFilter     = 'select:nth-of-type(3)';
    this.scopeFilter        = 'select:nth-of-type(4)';
    this.assetFilter        = 'select:nth-of-type(5)';
    this.resetFiltersBtn    = 'button:has-text("Reset Filters")';
    this.resetZoomBtn       = 'button:has-text("Reset Zoom"), button:has-text("RESET ZOOM")';

    // Content
    this.hoursWorkedSection = '[class*="hours"], text=Hours Worked';
    this.activityPivot      = 'text=Activity Hours Pivot';
    this.noHoursMsg         = 'text=No hours recorded for this project yet';
    this.noDataMsg          = 'text=No data available for this project';
    this.avgHoursRef        = 'text=Average hours reference';
    this.totalHoursLogged   = 'text=Total hours logged';
  }

  async goto() {
    await this.navigate(this.path);
    await this.page.waitForLoadState('networkidle');
  }

  async isPageLoaded() {
    const url = this.page.url();
    return url.includes('project-management') || url.includes('project');
  }

  async getBannerText() {
    const banner = await this.page.locator(this.overviewBanner).first().textContent().catch(() => '');
    return banner.trim();
  }

  async isTabActive(tabText) {
    const tab = this.page.locator(`[class*="tab"]:has-text("${tabText}"), button:has-text("${tabText}")`).first();
    const classes = await tab.getAttribute('class').catch(() => '');
    return classes.includes('active') || classes.includes('selected') || classes.includes('current');
  }

  async clickTab(tabText) {
    await this.page.locator(`[class*="tab"]:has-text("${tabText}"), button:has-text("${tabText}")`).first().click();
    await this.page.waitForTimeout(1000);
  }

  async getProjectDropdownOptions() {
    const selects = this.page.locator('select');
    const count = await selects.count();
    if (count > 0) {
      return await selects.first().locator('option').allTextContents();
    }
    return [];
  }

  async getFilterValue(filterName) {
    const filterMap = {
      String:             1,
      Location:           2,
      Scope:              3,
      NoAssetPerLocation: 4,
    };
    const idx = filterMap[filterName] ?? 0;
    const selects = this.page.locator('select');
    const val = await selects.nth(idx).inputValue().catch(() => null);
    if (val !== null) return val;
    // Fallback: get selected option text
    return await selects.nth(idx).locator('option:checked').textContent().catch(() => '');
  }

  async clickResetFilters() {
    await this.page.locator(this.resetFiltersBtn).click();
    await this.page.waitForTimeout(1000);
  }

  async isNoHoursMsgVisible() {
    return await this.page.locator(this.noHoursMsg).first().isVisible().catch(() => false);
  }

  async isNoDataMsgVisible() {
    return await this.page.locator(this.noDataMsg).first().isVisible().catch(() => false);
  }

  async isResetZoomVisible() {
    return await this.page.locator(this.resetZoomBtn).first().isVisible().catch(() => false);
  }

  async isAvgHoursRefVisible() {
    return await this.page.locator(this.avgHoursRef).first().isVisible().catch(() => false);
  }

  async isTotalHoursLoggedVisible() {
    return await this.page.locator(this.totalHoursLogged).first().isVisible().catch(() => false);
  }
}

module.exports = { ProjectManagementPage };
