export class MouseMove {
  public odiv: HTMLDivElement;
  public disX: number;
  public disY: number;
  public positionX: number;
  public positionY: number;

  constructor(e:MouseEvent) {

    this.odiv = e.target as HTMLDivElement;
    this.disX = 0;
    this.disY = 0;
    this.positionX = 0;
    this.positionY = 0;

    // 算出鼠标相对元素的位置
    if (this.odiv) {

      this.disX = e.clientX - this.odiv.offsetLeft;
      this.disY = e.clientY - this.odiv.offsetTop;
    }

    // 鼠标按下并移动的事件
    document.onmousemove = (e)=>{

      // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
      const left = e.clientX - this.disX;
      const top = e.clientY - this.disY;

      // 绑定元素位置到positionX和positionY上面
      this.positionX = top;

      this.positionY = left;

      // 移动当前元素
      this.odiv.style.left = left + 'px';
      this.odiv.style.top = top + 'px';

    };

    document.onmouseup = () => {

      document.onmousemove = null;
      document.onmouseup = null;

    };
  }
};
