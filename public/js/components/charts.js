import { dce } from '/js/shared/helpers.js';

class charts {
  constructor(params) {
    let container = dce({el: 'DIV'});
    let canvasHeight = (params.chartHeight) ? params.chartHeight : 320;

    // Setup canvas
    this.pixelRatio = (window.devicePixelRatio) ? window.devicePixelRatio : 1;

    let canvas = dce({
      el: 'CANVAS',
      attrbs: [['width', this.pixelRatio*320], ['height', this.pixelRatio*canvasHeight]],
      cssStyle: `width: 320px; height: ${canvasHeight}px;`
    });

    this.ctx = canvas.getContext ( '2d' );
    canvas.xCenter = 320 / 2;
    canvas.yCenter = canvasHeight / 2;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.canvas = canvas;

    // Pie chart
    this.pie = () => {
      let max = 2 / 100 ;
      let a = 0, b = 0;

      let temp = params.data;
      const total = temp.reduce((a,b) => a + b, 0);

      this.ctx.clearRect(0, 0, 320, canvasHeight);
      this.ctx.beginPath();
      let strokeWidth = canvasHeight/10;
      let radius = canvasHeight / 2 - strokeWidth / 2;
      b = 25;


      for( let i = 0, j = params.data.length; i < j ; i ++ ) {
        a = 100/total * params.data[i];
        let startAngle = (2-(max*b)) * Math.PI;
        let endAngle = (2-(max*(b+a))) * Math.PI;
        let counterClockwise = true;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.xCenter, this.canvas.yCenter, radius, startAngle, endAngle, counterClockwise);
        this.ctx.lineWidth = strokeWidth;
        this.ctx.strokeStyle = params.colors[i] ;
        this.ctx.stroke();
        b = b+a;
      }
      this.ctx.closePath();

      let legendsContainer = dce({el: 'UL', cssStyle: 'display: flex; justify-content: space-between'});
      for( let i = 0, j = params.labels.length; i < j ; i ++ ) {
        let tagTitle = dce({el: 'LI', content: params.labels[i], cssStyle: `color : ${params.colors[i]}; position: relative`});
        let legendsTagContainer = dce({el:'SPAN', cssClass: 'legends-holder'});
        let legend = dce({el: 'SPAN', cssClass: `legend type-${params.labels[i].toLowerCase()}`, content: params.data[i]});
        legendsTagContainer.appendChild(legend);
        tagTitle.appendChild(legendsTagContainer);
        legendsContainer.appendChild(tagTitle);
      }

      container.append(this.canvas, legendsContainer)
    }

    // Bar chart
    this.barchart = () => {
      let chartHeight = 160;
      let xAxisHeight = 20;
      let totalHeight = chartHeight+xAxisHeight;
      this.ctx.clearRect(0, 0, 320, totalHeight);
      this.ctx.beginPath();
      let strokeWidth = 10 / params.data.length;
      let roundCaps = strokeWidth / 2;
      let yMax = Math.max(...params.data.flat(Infinity));
      let yMaxRoundUp = Math.ceil(yMax / 10) * 10;

      this.ctx.lineCap = 'round';

      // Draw boundaries
      let yAxis = chartHeight / (yMaxRoundUp / 10);
      let yAxisTotal = chartHeight / yAxis;

      this.ctx.setLineDash([5, 15]);
      this.ctx.strokeStyle = 'rgba(255,255,255,.8)';

      for(let i=0, j = yAxisTotal+1; i<j; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(20, yAxis*i);
        this.ctx.lineTo(300, yAxis*i);
        if(i === j-1 ) {this.ctx.setLineDash([]);}
        this.ctx.stroke();
      }

      this.ctx.fillStyle = (params.color) ? params.colors[i] : 'rgba(255,255,255,.8)';
      this.ctx.font = "6.5px IBM Plex Mono";
      this.ctx.lineWidth = 1;

      for(let i=0, j = yAxisTotal+1; i<j; i++) {
        this.ctx.fillText(yMaxRoundUp-i*10,0,(yAxis*i) + 6.5, 20);
      }

      // draw bars
      for( let i = 0, j = params.data.length; i < j ; i ++ ) {
        for( let k = 0, l = params.data[i].length; k < l ; k ++ ) {
          this.ctx.beginPath();
          this.ctx.moveTo(
            20 + (i*(strokeWidth+3)) + k * 300 / params.data[i].length + strokeWidth / 2,
            chartHeight - roundCaps
            );
          this.ctx.lineTo(
            20 + (i*(strokeWidth+3)) + k * 300 / params.data[i].length + strokeWidth / 2,
            chartHeight - ((chartHeight/yMaxRoundUp * params.data[i][k]) - roundCaps))
          this.ctx.lineWidth = strokeWidth;

          this.ctx.strokeStyle = (params.colors) ? params.colors[i] : getComputedStyle(document.documentElement).getPropertyValue('--color-flash');
          if(params.data[i][k]) {
            this.ctx.stroke();
          }
        }
      }
      this.ctx.closePath();

      this.ctx.fillStyle = (params.color) ? params.colors[i] : 'rgba(255,255,255,.8)';
      this.ctx.font = "6.5px IBM Plex Mono";
      this.ctx.lineWidth = 1;
      for( let i = 0, j = params.xaxis.length; i < j ; i ++ ) {
        this.ctx.fillText(params.xaxis[i],20 + i * 300 / params.xaxis.length,totalHeight);
      }
      container.append(this.canvas)
    }

    if(params.type === 'pie') {this.pie();}
    if(params.type === 'barchart') {this.barchart();}

    this.render = () => {
      return container;
    }
  }
}

export default charts;
