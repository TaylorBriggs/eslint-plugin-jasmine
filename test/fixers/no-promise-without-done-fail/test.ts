it('', function(done): void {
  somethingAsync()
    .then(undefined, (err) => {
      expect(err).toBe(true);
      done();
    });
});
