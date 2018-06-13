export default {

  columnWidth: 260,
  activePosts: null,

  getIndex(grid) {
    let num = Infinity;
    let index = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i].posBottom < num) {
        num = grid[i].posBottom;
        index = i;
      }
    }
    return index;
  },

  calcPostPosition(grid, posts) {
    let gridIndex = 0;
    let hasLoopedOneTime = false;

    for (let post of posts) {
      post.posLeft = grid[gridIndex].posLeft;
      post.posBottom = grid[gridIndex].posBottom;

      grid[gridIndex].posBottom =
        grid[gridIndex].posBottom +
        Math.round(this.columnWidth / Number(post.ratio)) + 65;

      if (!hasLoopedOneTime) {
        gridIndex !== 4 ? gridIndex++ : hasLoopedOneTime = true; 
      }
      gridIndex = this.getIndex(grid);
    }
    return posts;
  },

  calcGrid(posts) {
    const grid = [];
    const columnNumber = Math.floor((window.innerWidth - 15) / this.columnWidth)
    let position = 0
    if (columnNumber === 0) {
      grid.push({posLeft: position, posBottom: 0});
    } else {
      for (let i = 0; i < columnNumber; i++) {
        grid.push({posLeft: position, posBottom: 0});
        position += this.columnWidth;
      }
    }
    return this.calcPostPosition(grid, posts);
  }
}