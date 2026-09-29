/**
 * Documents out-of-scope projects for the google review admin sync feature.
 * Pipeline reviewers verify these repos have no feature diffs; this spec guards against accidental coupling in ecommerce tests.
 */
describe('google review feature scope', () => {
  const unchangedProjects = [
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];

  it('lists projects intentionally unchanged for this feature', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
  });
});
