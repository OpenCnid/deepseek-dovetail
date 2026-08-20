# DSH private distribution

The deliverable is a package-owned skill directory or bundle, not a copy in a user/project skill home. For this compatibility package, build and pack from the source repository, inspect the tarball list, then install the tarball with:

```text
dsh plugin --profile web add {Absolute_Tarball_Path}
dsh plugin --profile headless add {Absolute_Tarball_Path}
```

Verify each composition with `dsh --profile {profile} --dump-config`, boot keylessly or with an explicitly approved provider, and remove with:

```text
dsh plugin --profile {profile} remove deepseek-dovetail
```

An out-of-tree bundle declares `dsh.bundle.patch` in `package.json`; its patch inserts named Cordis rows. The package manifest must contain built code and resources and no local `file:`, `link:`, `workspace:`, absolute-path, or floating Git dependency. A tarball or published prebuilt artifact needs no install-time build script. This package remains private and must not be published until the owner selects a license for new adapter/build/test code and approves provenance, ownership, visibility, platform, and evaluation cost.
