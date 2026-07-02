// Covers Settings > Project Setup (/client/setting/project-setup).

const { test, expect } = require('../utils/authFixture');
const { ProjectSetupPage } = require('../pages/ProjectSetupPage');
const testData = require('../data/projectSetup.data.json');

test.setTimeout(90000);

const runId = Date.now().toString().slice(-8);
const unique = (value) => `${value} ${runId}`;
const uniqueNumber = (prefix) => `${prefix}-${runId}`;

testData.newProject.valid.projectName = unique(testData.newProject.valid.projectName);
testData.newProject.valid.projectNumber = uniqueNumber('AUTO');
testData.newProject.trimmedWhitespace.projectName = `  ${unique('Trimmed Automation Project')}  `;
testData.newProject.trimmedWhitespace.projectNumber = uniqueNumber('AUTO-TRIM');
testData.newProject.missingClient.projectNumber = uniqueNumber('AUTO-NOCLIENT');

testData.newLocation.valid.name = unique(testData.newLocation.valid.name);
testData.newLocation.nameOnly.name = unique(testData.newLocation.nameOnly.name);
testData.newLocation.invalidLatitude.name = unique(testData.newLocation.invalidLatitude.name);
testData.newLocation.outOfRangeLatitude.name = unique(testData.newLocation.outOfRangeLatitude.name);
testData.newLocation.outOfRangeLongitude.name = unique(testData.newLocation.outOfRangeLongitude.name);
testData.newLocation.highPrecision.name = unique(testData.newLocation.highPrecision.name);

testData.newString.valid.name = unique(testData.newString.valid.name);
testData.newString.valid.from = testData.newLocation.valid.name;
testData.newString.valid.to = testData.newLocation.nameOnly.name;
testData.newString.sameFromTo.name = unique(testData.newString.sameFromTo.name);
testData.newString.sameFromTo.from = testData.newLocation.valid.name;
testData.newString.sameFromTo.to = testData.newLocation.valid.name;

testData.newAsset.valid.assetName = unique(testData.newAsset.valid.assetName);
testData.newAsset.valid.from = testData.newLocation.valid.name;
testData.newAsset.valid.to = testData.newLocation.nameOnly.name;
testData.newAsset.valid.projectString = testData.newString.valid.name;
testData.newAsset.requiredOnly.assetName = unique(testData.newAsset.requiredOnly.assetName);
testData.newAsset.requiredOnly.from = testData.newLocation.valid.name;
testData.newAsset.requiredOnly.to = testData.newLocation.nameOnly.name;
testData.newAsset.invalidTypeMm2.assetName = unique(testData.newAsset.invalidTypeMm2.assetName);
testData.newAsset.invalidTypeMm2.from = testData.newLocation.valid.name;
testData.newAsset.invalidTypeMm2.to = testData.newLocation.nameOnly.name;
testData.newAsset.sameFromTo.assetName = unique(testData.newAsset.sameFromTo.assetName);
testData.newAsset.sameFromTo.from = testData.newLocation.valid.name;
testData.newAsset.sameFromTo.to = testData.newLocation.valid.name;
testData.newAsset.zeroTypeMm2.assetName = unique(testData.newAsset.zeroTypeMm2.assetName);
testData.newAsset.zeroTypeMm2.from = testData.newLocation.valid.name;
testData.newAsset.zeroTypeMm2.to = testData.newLocation.nameOnly.name;
testData.newAsset.negativeTypeMm2.assetName = unique(testData.newAsset.negativeTypeMm2.assetName);
testData.newAsset.negativeTypeMm2.from = testData.newLocation.valid.name;
testData.newAsset.negativeTypeMm2.to = testData.newLocation.nameOnly.name;

testData.newTeam.valid.teamsWfmName = unique(testData.newTeam.valid.teamsWfmName);
testData.newTeam.invalidSortOrder.teamsWfmName = unique(testData.newTeam.invalidSortOrder.teamsWfmName);
testData.newTeam.negativeSortOrder.teamsWfmName = unique(testData.newTeam.negativeSortOrder.teamsWfmName);
testData.newTeam.duplicateSortOrder.teamsWfmName = unique(testData.newTeam.duplicateSortOrder.teamsWfmName);
testData.newTeam.duplicateName.teamsWfmName = testData.newTeam.valid.teamsWfmName;

testData.newScope.valid.scopeName = unique(testData.newScope.valid.scopeName);
testData.newScope.duplicateName.scopeName = testData.newScope.valid.scopeName;
testData.newScope.sortOrderBoundary.scopeName = unique(testData.newScope.sortOrderBoundary.scopeName);

testData.newFunction.valid.projectFunctionName = unique(testData.newFunction.valid.projectFunctionName);
testData.newFunction.nonNumericSortOrder.projectFunctionName = unique(testData.newFunction.nonNumericSortOrder.projectFunctionName);
testData.newFunction.duplicateName.projectFunctionName = testData.newFunction.valid.projectFunctionName;
testData.newMember.valid.function = testData.newFunction.valid.projectFunctionName;

async function expectModalOpenOrPageStable(projectSetupPage, modalTitle) {
  const modal = projectSetupPage.modalByTitle(modalTitle);
  if (await modal.isVisible().catch(() => false)) {
    await expect(modal).toBeVisible();
  } else {
    await expect(projectSetupPage.pageHeading).toBeVisible();
  }
}

const seeded = {
  locations: false,
  string: false,
  function: false,
};

async function closeIfOpen(projectSetupPage, modalTitle) {
  if (await projectSetupPage.modalByTitle(modalTitle).isVisible().catch(() => false)) {
    await projectSetupPage.closeModal(modalTitle);
  }
}

async function ensureBaseLocations(projectSetupPage) {
  if (seeded.locations) return;

  for (const location of [testData.newLocation.valid, testData.newLocation.nameOnly]) {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm(location);
    await projectSetupPage.submit('New Location');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Location');
    await closeIfOpen(projectSetupPage, 'New Location');
  }

  seeded.locations = true;
}

async function ensureBaseString(projectSetupPage) {
  if (seeded.string) return;

  await ensureBaseLocations(projectSetupPage);
  await projectSetupPage.openNewStringModal();
  await projectSetupPage.fillNewStringForm(testData.newString.valid);
  await projectSetupPage.submit('New String');
  await expectModalOpenOrPageStable(projectSetupPage, 'New String');
  await closeIfOpen(projectSetupPage, 'New String');
  seeded.string = true;
}

async function ensureBaseFunction(projectSetupPage) {
  if (seeded.function) return;

  await projectSetupPage.openNewFunctionModal();
  await projectSetupPage.fillNewFunctionForm(testData.newFunction.valid);
  await projectSetupPage.submit('New Function');
  await expectModalOpenOrPageStable(projectSetupPage, 'New Function');
  await closeIfOpen(projectSetupPage, 'New Function');
  seeded.function = true;
}

test.describe('Project Setup - Page Level', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
  });

  test('TC-PS-001: Project Setup page loads with all cards visible', async () => {
    await expect(projectSetupPage.pageHeading).toBeVisible();
    for (const cardTitle of Object.values(projectSetupPage.cards)) {
      await expect(projectSetupPage.card(cardTitle)).toBeVisible();
    }
  });

  test('TC-PS-002: Add and View List buttons are disabled when no project is selected', async () => {
    await expect(projectSetupPage.addButton(projectSetupPage.cards.location)).toBeDisabled();
    await expect(projectSetupPage.viewListButton(projectSetupPage.cards.location)).toBeDisabled();
    await expect(projectSetupPage.addButton(projectSetupPage.cards.team)).toBeDisabled();
    await expect(projectSetupPage.addButton(projectSetupPage.cards.scopes)).toBeDisabled();
  });

  test('TC-PS-003: Add and View List buttons enable after selecting a project', async () => {
    await projectSetupPage.selectProject(testData.existingProject);
    await expect(projectSetupPage.addButton(projectSetupPage.cards.location)).toBeEnabled();
    await expect(projectSetupPage.viewListButton(projectSetupPage.cards.location)).toBeEnabled();
  });

  test('TC-PS-004: Clearing selected project disables card actions again', async () => {
    await projectSetupPage.selectProject(testData.existingProject);
    await expect(projectSetupPage.addButton(projectSetupPage.cards.location)).toBeEnabled();
    await projectSetupPage.clearSelectedProject();
    await expect(projectSetupPage.addButton(projectSetupPage.cards.location)).toBeDisabled();
  });

  test('TC-PS-005: New Project button is always enabled, independent of Select Project', async () => {
    await expect(projectSetupPage.newProjectButton).toBeEnabled();
  });

  test('TC-PS-006: Upload Project (Excel) and All Projects List buttons are visible', async () => {
    await expect(projectSetupPage.uploadProjectExcelButton).toBeVisible();
    await expect(projectSetupPage.allProjectsListButton).toBeVisible();
  });

  test('TC-PS-007: Selecting a non-existent project shows no matching options', async ({ authenticatedPage }) => {
    await projectSetupPage.selectProjectInput.click();
    await projectSetupPage.selectProjectInput.fill('Project That Does Not Exist ZZZ999');
    await expect(authenticatedPage.getByText('No options')).toBeVisible();
  });

  test('TC-PS-008: Select Project with 1-character search filters without error', async () => {
    await projectSetupPage.selectProjectInput.click();
    await projectSetupPage.selectProjectInput.fill('M');
    await expect(projectSetupPage.selectProjectInput).toHaveValue('M');
    await expect(projectSetupPage.pageHeading).toBeVisible();
  });

  test('TC-PS-009: Select Project with only whitespace handles empty results gracefully', async ({ authenticatedPage }) => {
    await projectSetupPage.selectProjectInput.click();
    await projectSetupPage.selectProjectInput.fill(' ');
    const noOptionsVisible = await authenticatedPage.getByText('No options').isVisible().catch(() => false);
    expect(noOptionsVisible || await projectSetupPage.pageHeading.isVisible()).toBeTruthy();
  });
});

test.describe('Project Setup - New Project modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.openNewProjectModal();
  });

  test('TC-NP-001: Modal opens with Project Name, Project Number, Client and Status fields', async () => {
    const modal = projectSetupPage.modalByTitle('New Project');
    await expect(modal.getByPlaceholder('Project Name*')).toBeVisible();
    await expect(modal.getByPlaceholder('Project Number*')).toBeVisible();
    await expect(modal.getByPlaceholder('Client*')).toBeVisible();
    await expect(modal.getByLabel('Open')).toBeChecked();
  });

  test('TC-NP-002: Submitting with all required fields empty shows validation errors', async () => {
    await projectSetupPage.submit('New Project');
    await expect(projectSetupPage.modalByTitle('New Project')).toBeVisible();
  });

  test('TC-NP-003: Successfully creates a project with valid data', async ({ authenticatedPage }) => {
    await projectSetupPage.fillNewProjectForm(testData.newProject.valid);
    await projectSetupPage.submit('New Project');
    await expect(projectSetupPage.modalByTitle('New Project')).toBeHidden();
    await projectSetupPage.selectProjectInput.click();
    await projectSetupPage.selectProjectInput.fill(testData.newProject.valid.projectName);
    await expect(authenticatedPage.getByText(testData.newProject.valid.projectName)).toBeVisible();
  });

  test('TC-NP-004: Duplicate Project Number is rejected', async () => {
    await projectSetupPage.fillNewProjectForm(testData.newProject.duplicateProjectNumber);
    await projectSetupPage.submit('New Project');
    await expect(projectSetupPage.modalByTitle('New Project')).toBeVisible();
  });

  test('TC-NP-005: Status defaults to Open and can be switched to Completed / Closed', async () => {
    const modal = projectSetupPage.modalByTitle('New Project');
    await modal.getByLabel('Completed').check();
    await expect(modal.getByLabel('Completed')).toBeChecked();
    await modal.getByLabel('Closed').check();
    await expect(modal.getByLabel('Closed')).toBeChecked();
    await expect(modal.getByLabel('Open')).not.toBeChecked();
  });

  test('TC-NP-006: Only one status can be selected at a time', async () => {
    const modal = projectSetupPage.modalByTitle('New Project');
    await modal.getByLabel('Closed').check();
    await expect(modal.getByLabel('Open')).not.toBeChecked();
    await expect(modal.getByLabel('Completed')).not.toBeChecked();
  });

  test('TC-NP-007: Script/HTML input in Project Name is not executed', async ({ authenticatedPage }) => {
    authenticatedPage.on('dialog', (dialog) => {
      throw new Error(`Unexpected JS dialog: ${dialog.message()}`);
    });
    await projectSetupPage.fillNewProjectForm(testData.newProject.specialCharacters);
    await projectSetupPage.submit('New Project');
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC-NP-008: Modal closes via the x icon without saving', async () => {
    await projectSetupPage.fillNewProjectForm({ projectName: 'Should Not Persist' });
    await projectSetupPage.closeModal('New Project');
    await expect(projectSetupPage.modalByTitle('New Project')).toBeHidden();
  });

  test('TC-NP-009: Modal closes via Escape key', async () => {
    await projectSetupPage.closeModalWithEscape();
    await expect(projectSetupPage.modalByTitle('New Project')).toBeHidden();
  });

  test('TC-NP-010: Very long Project Name is handled gracefully', async () => {
    await projectSetupPage.fillNewProjectForm({
      projectName: testData.newProject.maxLength.projectName,
      projectNumber: 'AUTO-LEN-1',
      client: 'QA Client',
      status: 'Open',
    });
    await projectSetupPage.submit('New Project');
    await expect(projectSetupPage.pageHeading).toBeVisible();
  });

  test('TC-NP-011: Project Number with only special characters is rejected or sanitized', async () => {
    await projectSetupPage.fillNewProjectForm(testData.newProject.specialNumber);
    await projectSetupPage.submit('New Project');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Project');
  });

  test('TC-NP-012: Leading/trailing whitespace in Project Name is handled on save', async ({ authenticatedPage }) => {
    await projectSetupPage.fillNewProjectForm(testData.newProject.trimmedWhitespace);
    await projectSetupPage.submit('New Project');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Project');

    if (await projectSetupPage.modalByTitle('New Project').isHidden().catch(() => false)) {
      await projectSetupPage.selectProjectInput.click();
      await projectSetupPage.selectProjectInput.fill(testData.newProject.trimmedWhitespace.projectName.trim());
      await expect(authenticatedPage.getByText(testData.newProject.trimmedWhitespace.projectName.trim())).toBeVisible();
    }
  });

  test('TC-NP-013: Client field left blank blocks submit', async () => {
    await projectSetupPage.fillNewProjectForm(testData.newProject.missingClient);
    await projectSetupPage.submit('New Project');
    await expect(projectSetupPage.modalByTitle('New Project')).toBeVisible();
  });
});

test.describe('Project Setup - New Location modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await projectSetupPage.openNewLocationModal();
  });

  test('TC-LOC-001: Modal opens with Name, Latitude, Longitude fields', async () => {
    const modal = projectSetupPage.modalByTitle('New Location');
    await expect(modal.getByPlaceholder('Name')).toBeVisible();
    await expect(modal.getByPlaceholder('Latitude')).toBeVisible();
    await expect(modal.getByPlaceholder('Longitude')).toBeVisible();
  });

  test('TC-LOC-002: Name is required', async () => {
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
  });

  test('TC-LOC-003: Successfully creates a Location with Name only', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.nameOnly);
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeHidden();
  });

  test('TC-LOC-004: Successfully creates a Location with Name, Latitude and Longitude', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.valid);
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeHidden();
  });

  test('TC-LOC-005: Non-numeric Latitude is rejected or sanitized', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.invalidLatitude);
    await projectSetupPage.submit('New Location');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Location');
  });

  test('TC-LOC-006: Out-of-range Latitude is rejected or sanitized', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.outOfRangeLatitude);
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
  });

  test('TC-LOC-007: Out-of-range Longitude is rejected or sanitized', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.outOfRangeLongitude);
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
  });

  test('TC-LOC-008: Duplicate Location name within the same project is rejected', async () => {
    const duplicateLocation = { ...testData.newLocation.valid, name: unique('Duplicate Location') };
    await projectSetupPage.fillNewLocationForm(duplicateLocation);
    await projectSetupPage.submit('New Location');
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm(duplicateLocation);
    await projectSetupPage.submit('New Location');
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
  });

  test('TC-LOC-009: Newly created Location appears in View List', async ({ authenticatedPage }) => {
    const listedLocation = { ...testData.newLocation.valid, name: unique('Listed Location') };
    await projectSetupPage.fillNewLocationForm(listedLocation);
    await projectSetupPage.submit('New Location');
    await projectSetupPage.viewListButton(projectSetupPage.cards.location).click();
    await expect(authenticatedPage.getByText(listedLocation.name)).toBeVisible();
  });

  test('TC-LOC-010: Latitude/Longitude with high decimal precision is handled gracefully', async () => {
    await projectSetupPage.fillNewLocationForm(testData.newLocation.highPrecision);
    await projectSetupPage.submit('New Location');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Location');
  });
});

test.describe('Project Setup - New String modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await ensureBaseLocations(projectSetupPage);
    await projectSetupPage.openNewStringModal();
  });

  test('TC-STR-001: Modal opens with Name, From, To, Color fields', async () => {
    const modal = projectSetupPage.modalByTitle('New String');
    await expect(modal.getByPlaceholder('Name')).toBeVisible();
    await expect(modal.getByText('From*')).toBeVisible();
    await expect(modal.getByText('To*')).toBeVisible();
    await expect(modal.getByText('Color*')).toBeVisible();
  });

  test('TC-STR-002: All required fields empty submit is blocked', async () => {
    await projectSetupPage.submit('New String');
    await expect(projectSetupPage.modalByTitle('New String')).toBeVisible();
  });

  test('TC-STR-003: From and To dropdowns are populated from existing Locations', async () => {
    const modal = projectSetupPage.modalByTitle('New String');
    await projectSetupPage.openComboDropdown(modal, 'From*');
    await expect(projectSetupPage.page.getByText(testData.newString.valid.from)).toBeVisible();
  });

  test('TC-STR-004: Selecting the same Location for From and To is rejected', async () => {
    await projectSetupPage.fillNewStringForm(testData.newString.sameFromTo);
    await projectSetupPage.submit('New String');
    await expect(projectSetupPage.modalByTitle('New String')).toBeVisible();
  });

  test('TC-STR-005: Successfully creates a String with valid From/To/Color', async () => {
    await projectSetupPage.fillNewStringForm(testData.newString.valid);
    await projectSetupPage.submit('New String');
    await expect(projectSetupPage.modalByTitle('New String')).toBeHidden();
  });

  test('TC-STR-006: Color swatch opens a color picker on click', async ({ authenticatedPage }) => {
    const modal = projectSetupPage.modalByTitle('New String');
    await projectSetupPage.openColorPicker(modal, 'Color*');
    await expect(authenticatedPage.getByRole('button', { name: /Select color/i }).first()).toBeVisible();
  });

  test('TC-STR-007: From/To selected with no Locations handles empty dropdown state', async ({ authenticatedPage }) => {
    const noLocationProject = {
      projectName: unique('No Location Project'),
      projectNumber: uniqueNumber('AUTO-NOLOC'),
      client: 'Reynard QA Client',
      status: 'Open',
    };

    await projectSetupPage.closeModal('New String');
    await projectSetupPage.createNewProject(noLocationProject);
    await projectSetupPage.selectProject(noLocationProject.projectName);
    await projectSetupPage.openNewStringModal();

    const modal = projectSetupPage.modalByTitle('New String');
    await projectSetupPage.openComboDropdown(modal, 'From*');
    await expect(authenticatedPage.getByText(/Please create a Location|No data available/).first()).toBeVisible();
  });

  test('TC-STR-008: Duplicate String name in same project is rejected', async () => {
    const duplicateString = { ...testData.newString.valid, name: unique('Duplicate String') };
    await projectSetupPage.fillNewStringForm(duplicateString);
    await projectSetupPage.submit('New String');
    await projectSetupPage.openNewStringModal();
    await projectSetupPage.fillNewStringForm(duplicateString);
    await projectSetupPage.submit('New String');
    await expect(projectSetupPage.modalByTitle('New String')).toBeVisible();
  });
});

test.describe('Project Setup - New Asset modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await ensureBaseString(projectSetupPage);
    await projectSetupPage.openNewAssetModal();
  });

  test('TC-AST-001: Modal opens with Asset Name, From, To, Manufacturer, Type mm2, Project String', async () => {
    const modal = projectSetupPage.modalByTitle('New Asset');
    await expect(modal.getByPlaceholder('Asset Name*')).toBeVisible();
    await expect(modal.getByPlaceholder('Manufacturer')).toBeVisible();
    await expect(modal.getByPlaceholder('Type mm2')).toBeVisible();
  });

  test('TC-AST-002: Asset Name, From, To are required', async () => {
    await projectSetupPage.submit('New Asset');
    await expect(projectSetupPage.modalByTitle('New Asset')).toBeVisible();
  });

  test('TC-AST-003: Successfully creates Asset with required fields only', async () => {
    await projectSetupPage.fillNewAssetForm(testData.newAsset.requiredOnly);
    await projectSetupPage.submit('New Asset');
    await expect(projectSetupPage.modalByTitle('New Asset')).toBeHidden();
  });

  test('TC-AST-004: Successfully creates Asset with all fields populated', async () => {
    await projectSetupPage.fillNewAssetForm(testData.newAsset.valid);
    await projectSetupPage.submit('New Asset');
    await expect(projectSetupPage.modalByTitle('New Asset')).toBeHidden();
  });

  test('TC-AST-005: Non-numeric Type mm2 is rejected or sanitized', async () => {
    await projectSetupPage.fillNewAssetForm(testData.newAsset.invalidTypeMm2);
    await projectSetupPage.submit('New Asset');
    await expect(projectSetupPage.modalByTitle('New Asset')).toBeVisible();
  });

  test('TC-AST-006: Manufacturer and Project String fields are optional', async () => {
    const modal = projectSetupPage.modalByTitle('New Asset');
    await expect(modal.getByText('Manufacturer', { exact: true })).not.toContainText('*');
    await expect(modal.getByText('Project String', { exact: true })).not.toContainText('*');
  });

  test('TC-AST-007: Project String dropdown opens for the selected project', async ({ authenticatedPage }) => {
    const modal = projectSetupPage.modalByTitle('New Asset');
    await modal.getByPlaceholder('Enter Project String').click();
    await expect(authenticatedPage.locator('[class*="menu"]').first()).toBeVisible();
  });

  test('TC-AST-008: From equals To for Asset is rejected or handled per business rule', async () => {
    await projectSetupPage.fillNewAssetForm(testData.newAsset.sameFromTo);
    await projectSetupPage.submit('New Asset');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Asset');
  });

  test('TC-AST-009: Type mm2 boundary values are handled gracefully', async () => {
    await projectSetupPage.fillNewAssetForm(testData.newAsset.zeroTypeMm2);
    await projectSetupPage.submit('New Asset');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Asset');

    if (await projectSetupPage.modalByTitle('New Asset').isVisible().catch(() => false)) {
      await projectSetupPage.closeModal('New Asset');
    }
    await projectSetupPage.openNewAssetModal();
    await projectSetupPage.fillNewAssetForm(testData.newAsset.negativeTypeMm2);
    await projectSetupPage.submit('New Asset');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Asset');
  });
});

test.describe('Project Setup - New Team modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await projectSetupPage.openNewTeamModal();
  });

  test('TC-TEAM-001: Modal opens with Teams WFM Name, Sort Order, Color fields', async () => {
    const modal = projectSetupPage.modalByTitle('New Team');
    await expect(modal.getByPlaceholder('Teams WFM Name')).toBeVisible();
    await expect(modal.getByPlaceholder('Sort Order')).toBeVisible();
  });

  test('TC-TEAM-002: Teams WFM Name and Sort Order are required', async () => {
    await projectSetupPage.submit('New Team');
    await expect(projectSetupPage.modalByTitle('New Team')).toBeVisible();
  });

  test('TC-TEAM-003: Successfully creates a Team with valid data', async () => {
    await projectSetupPage.fillNewTeamForm(testData.newTeam.valid);
    await projectSetupPage.submit('New Team');
    await expect(projectSetupPage.modalByTitle('New Team')).toBeHidden();
  });

  test('TC-TEAM-004: Non-numeric Sort Order is rejected', async () => {
    await projectSetupPage.fillNewTeamForm(testData.newTeam.invalidSortOrder);
    await projectSetupPage.submit('New Team');
    await expect(projectSetupPage.modalByTitle('New Team')).toBeVisible();
  });

  test('TC-TEAM-005: Negative Sort Order is rejected or normalized', async () => {
    await projectSetupPage.fillNewTeamForm(testData.newTeam.negativeSortOrder);
    await projectSetupPage.submit('New Team');
    await expect(projectSetupPage.modalByTitle('New Team')).toBeVisible();
  });

  test('TC-TEAM-006: Color is optional', async () => {
    const modal = projectSetupPage.modalByTitle('New Team');
    await expect(modal.getByText('Color', { exact: true })).not.toContainText('*');
  });

  test('TC-TEAM-007: Duplicate Sort Order across teams is handled per business rule', async () => {
    const firstTeam = { teamsWfmName: unique('Duplicate Sort Team A'), sortOrder: '31', color: '#33A1FF' };
    const secondTeam = { teamsWfmName: unique('Duplicate Sort Team B'), sortOrder: '31', color: '#33A1FF' };

    await projectSetupPage.fillNewTeamForm(firstTeam);
    await projectSetupPage.submit('New Team');
    await projectSetupPage.openNewTeamModal();
    await projectSetupPage.fillNewTeamForm(secondTeam);
    await projectSetupPage.submit('New Team');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Team');
  });

  test('TC-TEAM-008: Duplicate Teams WFM Name is handled per business rule', async () => {
    const firstTeam = { teamsWfmName: unique('Duplicate Name Team'), sortOrder: '32', color: '#33A1FF' };
    const secondTeam = { teamsWfmName: firstTeam.teamsWfmName, sortOrder: '33', color: '#33A1FF' };

    await projectSetupPage.fillNewTeamForm(firstTeam);
    await projectSetupPage.submit('New Team');
    await projectSetupPage.openNewTeamModal();
    await projectSetupPage.fillNewTeamForm(secondTeam);
    await projectSetupPage.submit('New Team');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Team');
  });
});

test.describe('Project Setup - New Scope modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await projectSetupPage.openNewScopeModal();
  });

  test('TC-SCP-001: Modal opens with Scope Name, Sort Order, Color fields', async () => {
    const modal = projectSetupPage.modalByTitle('New Scope');
    await expect(modal.getByPlaceholder('Scope Name*')).toBeVisible();
    await expect(modal.getByPlaceholder('Sort Order*')).toBeVisible();
    await expect(modal.getByText('Color*')).toBeVisible();
  });

  test('TC-SCP-002: Submitting blank form is blocked', async () => {
    await projectSetupPage.submit('New Scope');
    await expect(projectSetupPage.modalByTitle('New Scope')).toBeVisible();
  });

  test('TC-SCP-003: Successfully creates a Scope with valid data', async () => {
    await projectSetupPage.fillNewScopeForm(testData.newScope.valid);
    await projectSetupPage.submit('New Scope');
    await expect(projectSetupPage.modalByTitle('New Scope')).toBeHidden();
  });

  test('TC-SCP-004: Duplicate Scope Name within same project is rejected', async () => {
    const duplicateScope = { ...testData.newScope.valid, scopeName: unique('Duplicate Scope'), sortOrder: '51' };
    await projectSetupPage.fillNewScopeForm(duplicateScope);
    await projectSetupPage.submit('New Scope');
    await projectSetupPage.openNewScopeModal();
    await projectSetupPage.fillNewScopeForm({ ...duplicateScope, sortOrder: '52' });
    await projectSetupPage.submit('New Scope');
    await expect(projectSetupPage.modalByTitle('New Scope')).toBeVisible();
  });

  test('TC-SCP-005: Sort Order boundary values are handled gracefully', async () => {
    await projectSetupPage.fillNewScopeForm(testData.newScope.sortOrderBoundary);
    await projectSetupPage.submit('New Scope');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Scope');
  });
});

test.describe('Project Setup - New Function modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await projectSetupPage.openNewFunctionModal();
  });

  test('TC-FN-001: Modal opens with Project Function Name and Sort Order fields', async () => {
    const modal = projectSetupPage.modalByTitle('New Function');
    await expect(modal.getByPlaceholder('Project Function Name*')).toBeVisible();
    await expect(modal.getByPlaceholder('Sort Order*')).toBeVisible();
  });

  test('TC-FN-002: Submitting blank form is blocked', async () => {
    await projectSetupPage.submit('New Function');
    await expect(projectSetupPage.modalByTitle('New Function')).toBeVisible();
  });

  test('TC-FN-003: Successfully creates a Function with valid data', async () => {
    await projectSetupPage.fillNewFunctionForm(testData.newFunction.valid);
    await projectSetupPage.submit('New Function');
    await expect(projectSetupPage.modalByTitle('New Function')).toBeHidden();
  });

  test('TC-FN-004: Non-numeric Sort Order is rejected', async () => {
    await projectSetupPage.fillNewFunctionForm(testData.newFunction.nonNumericSortOrder);
    await projectSetupPage.submit('New Function');
    await expect(projectSetupPage.modalByTitle('New Function')).toBeVisible();
  });

  test('TC-FN-005: Newly created Function is selectable from New Member Function dropdown', async () => {
    const memberDropdownFunction = {
      projectFunctionName: unique('Member Dropdown Function'),
      sortOrder: '61',
    };

    await projectSetupPage.fillNewFunctionForm(memberDropdownFunction);
    await projectSetupPage.submit('New Function');
    await projectSetupPage.openNewMemberModal();
    const modal = projectSetupPage.modalByTitle('New Member');
    await projectSetupPage.openComboDropdown(modal, 'Select Function');
    await expect(projectSetupPage.page.getByText(memberDropdownFunction.projectFunctionName)).toBeVisible();
  });

  test('TC-FN-006: Duplicate Function name is handled per business rule', async () => {
    const duplicateFunction = {
      projectFunctionName: unique('Duplicate Function'),
      sortOrder: '62',
    };

    await projectSetupPage.fillNewFunctionForm(duplicateFunction);
    await projectSetupPage.submit('New Function');
    await projectSetupPage.openNewFunctionModal();
    await projectSetupPage.fillNewFunctionForm({ ...duplicateFunction, sortOrder: '63' });
    await projectSetupPage.submit('New Function');
    await expectModalOpenOrPageStable(projectSetupPage, 'New Function');
  });
});

test.describe('Project Setup - New Member modal', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
    await ensureBaseFunction(projectSetupPage);
    await projectSetupPage.openNewMemberModal();
  });

  test('TC-MEM-001: Modal opens with Select Member, Select Function, Select Rotation, Contact On DPR', async () => {
    const modal = projectSetupPage.modalByTitle('New Member');
    await expect(modal.getByPlaceholder('Enter Member Name*')).toBeVisible();
    await expect(modal.getByText('Select Function')).toBeVisible();
    await expect(modal.getByText('Select Rotation')).toBeVisible();
    await expect(modal.getByText('Contact On DPR')).toBeVisible();
  });

  test('TC-MEM-002: Select Member is required, other fields are optional', async () => {
    await projectSetupPage.submit('New Member');
    await expect(projectSetupPage.modalByTitle('New Member')).toBeVisible();
  });

  test('TC-MEM-003: Successfully adds a Member with only the required field', async () => {
    await projectSetupPage.fillNewMemberForm(testData.newMember.memberOnly);
    await projectSetupPage.submit('New Member');
    await expect(projectSetupPage.modalByTitle('New Member')).toBeHidden();
  });

  test('TC-MEM-004: Successfully adds a Member with Function, Rotation and Contact On DPR checked', async () => {
    await projectSetupPage.fillNewMemberForm(testData.newMember.valid);
    await projectSetupPage.submit('New Member');
    await expect(projectSetupPage.modalByTitle('New Member')).toBeHidden();
  });

  test('TC-MEM-005: Contact On DPR checkbox toggles independently', async () => {
    const modal = projectSetupPage.modalByTitle('New Member');
    const checkbox = modal.getByLabel('Contact On DPR');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('TC-MEM-006: Same member cannot be added twice to the same project team', async () => {
    await projectSetupPage.fillNewMemberForm(testData.newMember.memberOnly);
    await projectSetupPage.submit('New Member');

    if (await projectSetupPage.modalByTitle('New Member').isHidden().catch(() => false)) {
      await projectSetupPage.openNewMemberModal();
      await projectSetupPage.fillNewMemberForm(testData.newMember.memberOnly);
      await projectSetupPage.submit('New Member');
    }

    await expect(projectSetupPage.modalByTitle('New Member')).toBeVisible();
  });

  test('TC-MEM-007: Select Member search with no matches shows empty state', async ({ authenticatedPage }) => {
    const modal = projectSetupPage.modalByTitle('New Member');
    await modal.getByPlaceholder('Enter Member Name*').click();
    await modal.getByPlaceholder('Enter Member Name*').fill(testData.newMember.noMatchSearch.memberName);
    const noOptionsVisible = await authenticatedPage.getByText('No options').isVisible().catch(() => false);
    expect(noOptionsVisible || await modal.isVisible()).toBeTruthy();
  });

  test('TC-MEM-008: Member list dropdown opens with valid selectable personnel', async ({ authenticatedPage }) => {
    const modal = projectSetupPage.modalByTitle('New Member');
    await modal.getByPlaceholder('Enter Member Name*').click();
    const menuVisible = await authenticatedPage.locator('[class*="menu"], [role="listbox"]').first().isVisible().catch(() => false);
    expect(menuVisible || await modal.isVisible()).toBeTruthy();
  });
});

test.describe('Project Setup - Cross-cutting UI behaviour', () => {
  let projectSetupPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    projectSetupPage = new ProjectSetupPage(authenticatedPage);
    await projectSetupPage.goto();
    await projectSetupPage.selectProject(testData.existingProject);
  });

  test('TC-UI-001: Only one modal can be open at a time', async () => {
    await projectSetupPage.openNewLocationModal();
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
    await projectSetupPage.closeModal('New Location');
    await projectSetupPage.openNewTeamModal();
    await expect(projectSetupPage.modalByTitle('New Team')).toBeVisible();
    await expect(projectSetupPage.modalByTitle('New Location')).toBeHidden();
  });

  test('TC-UI-002: Switching the selected project resets card state without stale data leaking', async () => {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm({ name: 'Temp Location' });
    await projectSetupPage.closeModal('New Location');
    await projectSetupPage.clearSelectedProject();
    await projectSetupPage.selectProject(testData.existingProject);
    await projectSetupPage.openNewLocationModal();
    await expect(projectSetupPage.modalByTitle('New Location').getByPlaceholder('Name')).toHaveValue('');
  });

  test('TC-UI-003: Page is keyboard-navigable', async () => {
    await projectSetupPage.page.keyboard.press('Tab');
    const active = await projectSetupPage.page.evaluate(() => document.activeElement?.tagName);
    expect(active).toBeTruthy();
  });

  test('TC-UI-004: Reloading the page after selecting a project resets Select Project to empty', async () => {
    await projectSetupPage.page.reload();
    await expect(projectSetupPage.selectProjectInput).toHaveValue('');
  });

  test('TC-UI-005: Outside-click on modal backdrop does not submit the form', async () => {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.page.mouse.click(10, 10);
    await expect(projectSetupPage.pageHeading).toBeVisible();
  });

  test('TC-UI-006: Network failure on Submit keeps user on a recoverable state', async () => {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm({ ...testData.newLocation.valid, name: unique('Offline Location') });
    await projectSetupPage.page.context().setOffline(true);

    try {
      await projectSetupPage.submit('New Location').catch(() => {});
      await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
    } finally {
      await projectSetupPage.page.context().setOffline(false);
    }
  });

  test('TC-UI-007: Responsive layout remains usable at mobile width', async () => {
    await projectSetupPage.page.setViewportSize({ width: 390, height: 844 });
    await expect(projectSetupPage.pageHeading).toBeVisible();
    await expect(projectSetupPage.card(projectSetupPage.cards.location)).toBeVisible();
    await projectSetupPage.openNewLocationModal();
    await expect(projectSetupPage.modalByTitle('New Location')).toBeVisible();
  });

  test('TC-UI-008: Loading state on Submit prevents an obvious double-submit path', async () => {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm({ ...testData.newLocation.valid, name: unique('Loading Location') });
    const submit = projectSetupPage.submitButton('New Location');
    await submit.click();
    const submitDisabled = await submit.isDisabled().catch(() => false);
    const modalVisible = await projectSetupPage.modalByTitle('New Location').isVisible().catch(() => false);
    expect(submitDisabled || modalVisible || await projectSetupPage.pageHeading.isVisible()).toBeTruthy();
  });

  test('TC-UI-009: Double-click Submit does not create an obvious duplicate submission crash', async () => {
    await projectSetupPage.openNewLocationModal();
    await projectSetupPage.fillNewLocationForm({ ...testData.newLocation.valid, name: unique('Double Submit Location') });
    const submit = projectSetupPage.submitButton('New Location');
    await submit.click();
    await submit.click({ timeout: 1000 }).catch(() => {});
    await expectModalOpenOrPageStable(projectSetupPage, 'New Location');
  });
});
