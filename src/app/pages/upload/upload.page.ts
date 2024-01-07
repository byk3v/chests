import { Component } from '@angular/core';
import {ChestType, ParsedChest} from "../../models/parsed-chest";
import Tesseract from "tesseract.js";
import {createClient} from "@supabase/supabase-js";
import {environment} from "../../../environments/environment";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage {
  extractedText: string = '';
  parsedData:ParsedChest[] = [];
  substringsMod:string[] = [];

  constructor(private dataService: DataService) {}

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length === 0) {
      alert('Please select one or more image files.');
      return;
    }

    // Check if a file is selected and it's an image
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        this.processImage(file);
      } else {
        alert('Skipping non-image file: ' + file.name);
      }
    }

  }

  async processImage(imageFile: File) {
    const imageBlob = await this.toBlob(imageFile);
    const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng');
    this.extractedText = text;
    this.extractText();
  }

  toBlob(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Blob([reader.result as ArrayBuffer]));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  extractText() {
    const temp =  this.extractedText.replace(/[\r\n]+/g, ' ');
    const substrings = temp.split(/\s+(Crypt|Arena|Bank|Citadel(?! Chest)|Clan wealth|Epic inferno squad|personal reward|Epic Undead squad|Rush tournament| Heroic monster| Mercenary Exchange)/g);

    const parsedData = [];

    for (let i = 0; i < substrings.length - 1; i += 2) {
      const merged = substrings[i] + ' ' + substrings[i + 1];
      this.substringsMod.push(merged);
    }

    for (let i = 0; i < this.substringsMod.length; i ++) {
      const titleMatch = this.substringsMod[i].match(/(.*?\sChest)/);
      const title = titleMatch ? titleMatch[0].trim() : '';

      const playerMatch = this.substringsMod[i].match(/From:\s(.*?)\sSource:/);
      const player = playerMatch ? playerMatch[1] : '';

      const typeMatch = this.substringsMod[i].match(/Source:\s(.*)/);
      const type = typeMatch ? typeMatch[1] : '';

      const {level, chestType} = this.parseString(type);

      parsedData.push({ title, player, level, chestType });
    }

    this.parsedData = parsedData;
    this.insertChestData(parsedData);
    console.log(this.parsedData);
  }

  parseString(originalString: string): ChestType {
    const regex = /^Level (\d+)\s(.+)$/;

    const match = originalString.match(regex);

    if (match) {
      const level = parseInt(match[1], 10);
      const chestType = match[2];
      return { level, chestType };
    } else {
      return { level: null, chestType: originalString };
    }
  }

  insertChestData(data: ParsedChest[]){
    this.dataService.insertChests(data);
  }

}
