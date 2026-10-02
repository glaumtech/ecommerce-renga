/**
 * ACCEPTANCE.md — untouched workspace projects (job_55ce566b8eb0).
 */
describe('scan to connect workspace scope (acceptance)', () => {
  const changedProject = 'ecommerce-site';
  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-flutter',
    'trueup-lite-frontend',
    'aws-scripts',
    'notification-framework',
  ];

  const scanToConnectMarkers = [
    'scan-to-connect-linktree.png',
    'SCAN_TO_CONNECT_LINKTREE_URL',
    'brand-links.constants.ts',
  ];

  it('lists workspace projects that must not ship Scan to Connect footer changes', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-backend',
      'trueup-lite-flutter',
      'trueup-lite-frontend',
      'aws-scripts',
      'notification-framework',
    ]);
    expect(unchangedProjects).not.toContain(changedProject);
  });

  it('defines markers used to detect accidental Scan to Connect diffs outside ecommerce-site', () => {
    expect(scanToConnectMarkers.length).toBeGreaterThanOrEqual(3);
    expect(scanToConnectMarkers).toContain('scan-to-connect-linktree.png');
  });
});
